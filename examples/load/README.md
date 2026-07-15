# k6 Load Harness

This k6 script validates baseline performance and stream behavior for the reference MCP server.

File:

- `k6-streamable.js`

Scenarios:

- `init_burst` - 50 VUs run one initialize call each.
- `tool_call_steady` - 20 VUs call `tools/call` (`echo`) for 60s.
- `sse_streams` - 5 VUs call `tools/call` (`stream_echo`) for 30s and verify SSE payload integrity.

Thresholds:

- `http_req_duration{scenario:tool_call_steady}: p(99) < 300ms`
- `http_req_failed: rate < 0.01`
- `stream_stall_failures: count == 0`

## Run locally

1. Start the reference server:

```bash
cd examples/server
npm ci
npm run dev
```

2. In a second terminal, run k6:

```bash
k6 run examples/load/k6-streamable.js -e BASE_URL=http://localhost:8080
```

## Authenticated target

If the target requires OAuth bearer tokens, provide one explicitly:

```bash
k6 run examples/load/k6-streamable.js \
  -e BASE_URL=https://mcp.example.com \
  -e AUTH_BEARER=<token>
```
