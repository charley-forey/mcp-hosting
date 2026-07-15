# 08. Deployment checklist

A go/no-go gate for putting a streamable HTTP MCP server in front of real users. Walk this list before every promotion to production. It is intentionally exhaustive; everything here is grounded in the spec or in published production guides.

> **How to use this**: copy this file into your service's repo as `DEPLOY-CHECKLIST.md`, tick boxes per environment (dev/staging/prod), and require the prod column to be 100% green before exposing the MCP externally.

## Spec compliance

- [ ] Server exposes a single MCP endpoint that accepts `POST` and `GET`. [src: spec-transports]
- [ ] Server returns either `Content-Type: application/json` (one response) or `text/event-stream` (SSE) on POST request payloads. [src: spec-transports]
- [ ] Server returns `202 Accepted` (no body) for JSON-RPC notifications and responses. [src: spec-transports]
- [ ] Server validates `MCP-Protocol-Version` and rejects unknown values with `400`. [src: spec-transports]
- [ ] Server includes `Mcp-Method` and (where applicable) `Mcp-Name` validation; rejects header/body mismatches. [src: spec-sep-2243]
- [ ] Stateful servers issue `Mcp-Session-Id` only at `initialize` and reject other requests without it via `400`. [src: spec-transports]
- [ ] `DELETE` is implemented (or returns `405` deliberately). [src: spec-transports]
- [ ] Backwards compatibility decision is documented (support legacy HTTP+SSE or not). [src: spec-transports]

## Transport hygiene

- [ ] TLS terminates at the ingress with TLS 1.3. [src: prod-mcpcat-config]
- [ ] HSTS header set with `max-age >= 31536000`. [src: prod-mcpcat-streamable]
- [ ] HTTP/2 (or HTTP/1.1 chunked transfer) is end-to-end. [src: k8s-skywork-helm]
- [ ] ingress-nginx: `proxy-buffering: "off"`, `proxy-read-timeout: "3600"`, `proxy-send-timeout: "3600"`, `proxy-http-version: "1.1"`. [src: k8s-tmdevlab-scalable, k8s-skywork-helm]
- [ ] Smoke test confirms SSE chunks arrive in real time (no buffering). [src: k8s-tmdevlab-scalable]
- [ ] `Origin` allowlist enforced at ingress AND at server. [src: spec-transports]

## Auth and identity

- [ ] If non-public: OAuth 2.1 issuer, audience, and `/.well-known/oauth-protected-resource` published. [src: spec-authorization]
- [ ] PKCE required on all client integrations. [src: spec-authorization]
- [ ] Tokens validated for signature, issuer, audience, expiry, scopes. [src: spec-authorization]
- [ ] Audience is the exact canonical resource URI of this MCP. [src: spec-authorization]
- [ ] Tokens are not passed through unchanged to downstream services. [src: spec-authorization]
- [ ] JWKS cached with TTL and graceful re-fetch. [src: sdk-mcp-oauth-blueprint]
- [ ] Sessions, if used, are externalized (JWT or Redis). No replica-local session memory. [src: prod-fordel-mcp]
- [ ] Session-revocation path exists OR token TTLs are short enough to make it moot. [src: prod-fordel-mcp]

## Kubernetes posture

- [ ] Container runs as **non-root** with read-only root filesystem and dropped capabilities. [src: prod-systemprompt-deploy]
- [ ] Pod `securityContext` enforces `runAsNonRoot: true`, `seccompProfile: RuntimeDefault`. [src: prod-systemprompt-deploy]
- [ ] Resource `requests` and `limits` set; values informed by load tests (not guessed). [src: k8s-skywork-helm]
- [ ] HPA configured (CPU at minimum; per-method RPS where available). [src: k8s-skywork-helm]
- [ ] HPA `scaleDown` is conservative (5 min stabilization, ≤25% per minute) so SSE streams don't get evicted. [src: k8s-tmdevlab-scalable]
- [ ] PodDisruptionBudget configured (`minAvailable >= 2`). [src: prod-systemprompt-deploy]
- [ ] Liveness on `/healthz` (cheap, no dependencies). [src: prod-mcpcat-config]
- [ ] Readiness on `/readyz` (includes downstream checks). [src: prod-mcpcat-config]
- [ ] `terminationGracePeriodSeconds >= 60` and `preStop` hook drains active streams.
- [ ] NetworkPolicy restricts ingress to ingress-controller namespace. [src: k8s-tmdevlab-scalable]
- [ ] ServiceAccount has `automountServiceAccountToken: false` unless explicitly required.

## Secrets and config

- [ ] Secrets managed by Vault / External Secrets Operator / cloud KMS. **No** plaintext in `values.yaml`. [src: k8s-skywork-helm, prod-mcpcat-config]
- [ ] Secret rotation runbook exists and has been exercised in staging.
- [ ] OAuth client secret, downstream API keys, JWT signing keys all rotated within the last 90 days.
- [ ] No secrets in container env vars exposed via `kubectl describe pod` (use volume mounts of files).

## Observability

- [ ] Structured JSON logs, one event per request, with `request_id`, `mcp_method`, `mcp_name`. [src: prod-systemprompt-deploy]
- [ ] Prometheus metrics: rate, errors, duration per `mcp_method`/`mcp_name`. [src: prod-mcpcat-config]
- [ ] OpenTelemetry traces exported with method as operation name. [src: prod-systemprompt-deploy]
- [ ] Sessions and active SSE streams have gauges; alerts on growth. [src: k8s-tmdevlab-scalable]
- [ ] Alerts wired: 5xx burn rate, auth failure spikes, p99 latency, HPA-at-max.
- [ ] Dashboards exist for: requests per `mcp_name`, error rate, latency percentiles, active streams. [src: prod-mcpcat-config]
- [ ] Logs retained ≥ 7 days. [src: prod-mcpcat-config]
- [ ] Token validation outcomes are logged with reason (audience / expiry / signature). [src: spec-authorization]

## Reliability

- [ ] Rolling-deploy verified: in-flight SSE streams complete or fail gracefully. [src: k8s-tmdevlab-scalable]
- [ ] Rollback procedure documented (`helm rollback`, GitOps revert).
- [ ] Backup of session state (if Redis) included in cluster backup plan.
- [ ] Capacity tested at 2x expected peak; HPA proven to scale within target latency. [src: k8s-skywork-helm]
- [ ] Chaos test or game-day exercise scheduled within first 90 days of production.

## Supply chain

- [ ] Image built from a known-good base (distroless / official slim). [src: prod-systemprompt-deploy]
- [ ] Image scanned (Trivy / Grype) on every CI build; high-severity CVEs gate the merge.
- [ ] SBOM generated and stored alongside the image (Syft / cosign attest).
- [ ] Image is signed; admission policy (Kyverno/Cosign) enforces signature verification. (Aspirational for some teams; mandatory for regulated workloads.)

## Documentation

- [ ] README explains what tools/resources/prompts the MCP exposes and the auth model.
- [ ] Internal runbook documents on-call response for the top 5 alert types ([09 Internal runbook](09-internal-runbook.md)).
- [ ] Versioned changelog. Every protocol-version bump or behavior change is in it.

## Final go/no-go

- [ ] Smoke test (`examples/helm/smoke-test.ps1`) PASS in production environment after deploy.
- [ ] On-call notified, dashboards bookmarked, alert routing verified.
- [ ] Rollback plan rehearsed (not just documented).
- [ ] Sign-off from: service owner, security reviewer, on-call lead.

If any box is unchecked in production, you are not ready to deploy. Fix or accept the risk in writing.
