# 07. Observability

You cannot operate an MCP you cannot see. This chapter is the minimum viable observability for a production MCP: structured logs, RED metrics, OpenTelemetry traces, and health probes that mean what they say.

## What to instrument

Three signals, in priority order: [src: prod-mcpcat-config, prod-systemprompt-deploy]

1. **Logs** - one structured event per request, with the SEP-2243 header values denormalized for search.
2. **Metrics** - RED (Rate, Errors, Duration) per `Mcp-Method` and per `Mcp-Name`, plus pod-level CPU/memory/queue depth.
3. **Traces** - OpenTelemetry spans with the JSON-RPC method as the operation name, propagated downstream to whatever the tools call.

You can survive without traces. You cannot survive without logs and metrics.

## Structured logs

Log one JSON line per HTTP request. At minimum:

```json
{
  "ts":            "2026-04-30T20:49:39Z",
  "level":         "info",
  "service":       "mcp-server",
  "version":       "1.4.2",
  "request_id":    "01HVT2YK4EXAMPLE",
  "session_id":    "sha256:abcd...",
  "remote_ip":     "10.1.2.3",
  "origin":        "https://chat.example.com",
  "http_method":   "POST",
  "path":          "/mcp",
  "status":        200,
  "duration_ms":   42,
  "mcp_protocol":  "2025-06-18",
  "mcp_method":    "tools/call",
  "mcp_name":      "billing.lookup_invoice",
  "user_sub":      "u_12345",
  "stream":        false
}
```

Rules:

- One log line per request. Correlation lives via `request_id`. [src: prod-systemprompt-deploy]
- Hash session IDs before logging. The raw value is a credential. [src: spec-transports, prod-mcpcat-config]
- Never log access tokens, refresh tokens, or PII inside tool inputs/outputs at info level. Reserve `debug` for that, gated behind a flag.
- Log one event per **stream lifecycle** event for SSE: `stream_started`, `stream_closed` with byte count and duration. Otherwise long streams disappear from your dashboards.

## Metrics: RED + saturation

Expose Prometheus metrics on `/metrics` (or push to OTLP). The reference Helm chart wires up a `ServiceMonitor` that picks up the standard endpoints. [src: prod-mcpcat-config]

| Metric | Type | Labels | Why |
|---|---|---|---|
| `mcp_requests_total` | counter | `mcp_method`, `mcp_name`, `status_class` | Rate per tool. [src: spec-sep-2243] |
| `mcp_request_duration_seconds` | histogram | `mcp_method`, `mcp_name` | Duration per tool; alert on p99. |
| `mcp_request_errors_total` | counter | `mcp_method`, `mcp_name`, `error_kind` | Errors per tool, segmented by category. |
| `mcp_active_streams` | gauge | `mcp_method` | Live SSE streams. Critical for capacity planning. |
| `mcp_session_count` | gauge | (none) | Current sessions; tracks whether your session store is leaking. |
| `mcp_oauth_validation_failures_total` | counter | `reason` | Tokens rejected by reason (audience, expiry, signature). |
| `process_cpu_seconds_total` | counter | (Prometheus default) | Saturation. |
| `process_resident_memory_bytes` | gauge | (Prometheus default) | Saturation. |

Two non-obvious metrics worth adding:

- **`mcp_request_body_bytes`** - histogram of request sizes. MCP payloads can grow surprisingly large when tools accept structured inputs.
- **`mcp_sse_chunk_interval_seconds`** - histogram of inter-chunk intervals on active streams. Spikes here are the symptom of a buffering misconfiguration; you want to detect that before clients do. [src: k8s-tmdevlab-scalable]

## Tracing with OpenTelemetry

Use the OTLP exporter pointed at your collector. The Helm chart sets `OTEL_EXPORTER_OTLP_ENDPOINT` and `OTEL_SERVICE_NAME` automatically when `observability.otel.enabled: true`.

Span shape:

```text
mcp.request                     (server span, root)
  attributes:
    mcp.method = "tools/call"
    mcp.name   = "billing.lookup_invoice"
    mcp.session_id = sha256:...
    http.route = "/mcp"
    http.status_code = 200
  events:
    stream_started, stream_chunk, stream_ended
  child spans:
    db.query
    http.outbound_call
```

Best practices: [src: prod-systemprompt-deploy]

- Use the JSON-RPC `method` as the operation name. This makes per-method dashboards trivial.
- Attach `mcp.method` and `mcp.name` as span attributes (mirror the SEP-2243 headers).
- Propagate W3C trace context (`traceparent`) outbound when the MCP calls downstream services.
- For SSE streams, emit one span per stream and child events per chunk; don't create a span per chunk (cardinality explosion).

## Health probes that mean what they say

Two endpoints, two contracts: [src: prod-mcpcat-config]

```text
GET /healthz
  - 200 OK if the process is up and not in a known-bad state.
  - 500 only on internal panic, fatal init failure.
  - Cheap. No downstream calls. Liveness probe consumes this.

GET /readyz
  - 200 OK if /healthz passes AND every required dependency is reachable.
  - 503 if any downstream dependency (Redis, OAuth issuer, downstream API) is failing.
  - Slightly more expensive. Cached for ~5 s. Readiness probe consumes this.
```

This separation matters because:

- A `/readyz` failure should remove a pod from the Service endpoints (traffic drains).
- A `/healthz` failure should kill the pod.
- A Redis blip cascading through `/healthz` would kill every pod simultaneously. Don't do that.

## Alerting (the short version)

Start with these alerts. Tune as you learn your traffic shape.

| Alert | Condition | Severity |
|---|---|---|
| MCP unavailable | `up{job="mcp"} == 0 for 1m` across all replicas | Page |
| 5xx burn rate | `sum(rate(mcp_requests_total{status_class="5xx"}[5m])) / sum(rate(mcp_requests_total[5m])) > 0.02` | Page |
| Auth failure spike | `increase(mcp_oauth_validation_failures_total[5m]) > 100` | Page (possible attack) |
| p99 latency regression | `histogram_quantile(0.99, mcp_request_duration_seconds_bucket) > 5s` | Ticket |
| SSE stream stall | `histogram_quantile(0.95, mcp_sse_chunk_interval_seconds_bucket) > 10s` | Ticket |
| Session count growth | `deriv(mcp_session_count[1h]) > 100/min` | Ticket (leak suspected) |
| HPA at max | `kube_horizontalpodautoscaler_status_current_replicas == max_replicas for 15m` | Ticket |

[src: prod-mcpcat-config, prod-systemprompt-deploy]

## Operating playbook (the dashboards you actually want)

The single most useful dashboard panels:

1. **Requests per second by `mcp_name`**. Shows which tools are hot.
2. **Error rate by `mcp_name` and `error_kind`**. Shows where things break.
3. **p50/p95/p99 latency by `mcp_name`**. Shows which tools regress.
4. **Active SSE streams over time**. Shows whether scale-down is safe.
5. **OAuth validation outcomes**. Shows whether your auth integration is healthy.
6. **Pod CPU/memory usage**. Tells you when to right-size.

Build these once; they pay back forever.

## Logging stack: practical recommendations

- Ship logs via Fluent Bit / Vector to Loki / Elasticsearch / a managed service. Don't write to stdout and pray; you'll lose lines during pod restart unless the collector is co-located. [src: prod-mcpcat-config]
- Retain at least 7 days of logs. Incidents take that long to reconstruct.
- Make `request_id` the universal correlation key. Surface it in error responses to clients so they can quote it in tickets.

## What not to instrument

To keep cardinality bounded:

- **Don't label metrics with `session_id` or `user_id`**. Use traces / logs for per-user lookups.
- **Don't label with raw `Mcp-Name`** if your name space is unbounded (e.g., resource URIs include user paths). Bucket by tool family in the metric label and put the full name in trace attributes.
- **Don't emit a span per SSE chunk**. Emit per stream, with chunk events.

## Load-testing baseline

Operational dashboards are only useful when you know what \"normal\" looks like. The canonical baseline for this repo is the k6 harness at [`examples/load/k6-streamable.js`](../examples/load/k6-streamable.js).

It executes three scenarios:

- `init_burst` - many concurrent `initialize` requests.
- `tool_call_steady` - sustained `tools/call` traffic for p99 latency and error rate.
- `sse_streams` - streaming tool calls that verify SSE payload progress + final event.

The script fails when thresholds are breached:

- `http_req_duration{scenario:tool_call_steady}: p(99) < 300ms`
- `http_req_failed: rate < 0.01`
- `stream_stall_failures: count == 0`

Use it locally before changing resource requests/limits or HPA settings, and in CI as a regression guard (see [`.github/workflows/k8s-smoke.yml`](../.github/workflows/k8s-smoke.yml)).

## Wiring it up

The reference Helm values enable these by default:

```yaml
observability:
  otel:
    enabled: true
    exporterEndpoint: "http://otel-collector.observability.svc.cluster.local:4318"
  metrics:
    serviceMonitor:
      enabled: true
      interval: 30s
```

Disable individual pieces if your stack doesn't have the receiver yet, but plan to enable them - operating an MCP without traces is possible, but operating one without metrics will eventually wake someone up at 3 AM.
