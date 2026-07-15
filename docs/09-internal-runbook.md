# 09. Internal runbook (template)

> **Status: TEMPLATE.** This chapter is the team-specific operational runbook. The scaffolding is in place; the bracketed `<TBD: ...>` markers below need to be filled in by someone with the specific cluster, registry, CI, and secrets-backend details. Search for `<TBD:` in this file to see what's missing.

This document is the on-call's first read at 3 AM. Keep it short, specific, and current.

## Service inventory

| Field | Value |
|---|---|
| MCP service name | `<TBD: e.g., billing-mcp>` |
| Internal owner | `<TBD: team @slack-channel>` |
| On-call rotation | `<TBD: PagerDuty / Opsgenie service link>` |
| Source repo | `<TBD: github.com/your-org/your-mcp>` |
| Image registry | `<TBD: ghcr.io/your-org or registry.example.com>` |
| Helm chart path | [`examples/helm/`](../examples/helm/) (this repo) or `<TBD: your fork>` |
| Production URL | `<TBD: https://mcp.example.com/mcp>` |
| Staging URL | `<TBD: https://mcp.staging.example.com/mcp>` |

## Cluster targets

| Environment | Cluster | Region | Namespace | Replicas |
|---|---|---|---|---|
| dev | `<TBD: eks-dev / gke-dev / aks-dev / on-prem>` | `<TBD>` | `mcp-dev` | 1 |
| staging | `<TBD>` | `<TBD>` | `mcp-staging` | 2 |
| prod | `<TBD>` | `<TBD>` | `mcp` | 3-10 (HPA) |

Cluster access:

```powershell
# <TBD: how to log in to your clusters>
# e.g. for EKS:
# aws eks update-kubeconfig --name eks-prod --region us-east-1 --profile mcp-prod
# kubectl config use-context arn:aws:eks:us-east-1:1234:cluster/eks-prod
```

## Image registry and pull secrets

- Registry: `<TBD>`
- CI builds and pushes on every merge to `main`. Image tag = git SHA (short).
- Pull secret in cluster: `<TBD: e.g., regcred>`. Rotate every `<TBD: 90>` days.

```powershell
# <TBD: how to refresh the pull secret if rotated>
```

## CI/CD pipeline

Pipeline: `<TBD: GitHub Actions / GitLab CI / Jenkins / ArgoCD>`

Stages (canonical):

1. **Lint**: `helm lint ./examples/helm`, `kubeval`, ESLint/Black/etc.
2. **Build**: `docker build`, push to `<TBD: registry>` tagged with git SHA.
3. **Scan**: Trivy / Grype. High-severity CVEs fail the build.
4. **Deploy dev**: GitOps reconciles `<TBD: argocd-app-dev>`.
5. **Smoke test dev**: [`examples/helm/smoke-test.ps1`](../examples/helm/smoke-test.ps1).
6. **Promote staging**: manual approval required.
7. **Smoke test staging**.
8. **Promote prod**: requires two-person approval per change-management policy `<TBD>`.

Rollback:

```powershell
helm -n <namespace> history mcp
helm -n <namespace> rollback mcp <previous-revision>
```

GitOps rollback: revert the deploy commit; ArgoCD/Flux reconciles within ~`<TBD: 60>` seconds.

## Secrets backend

- Backend: `<TBD: HashiCorp Vault / External Secrets Operator + AWS Secrets Manager / Azure Key Vault / GCP Secret Manager>`
- Path / namespace: `<TBD: kv/mcp/* or projects/.../secrets/...>`
- Rotation cadence: `<TBD: 90 days for OAuth client secret, 30 days for JWT signing key>`
- Sync to cluster: `<TBD: ExternalSecret CRD or Vault Agent injector>`

Where each secret lives:

| Secret | Path | Consumed as |
|---|---|---|
| OAuth client secret | `<TBD>` | Env var `OAUTH_CLIENT_SECRET` (file mount preferred) |
| JWT signing key | `<TBD>` | File `/var/run/secrets/jwt/private.pem` |
| Redis URL (with creds) | `<TBD>` | Env var `MCP_REDIS_URL` (file mount preferred) |
| Downstream API tokens | `<TBD>` | Per-call mint via service account, not stored |

## OAuth integration

- Authorization server: `<TBD: e.g., Okta / Auth0 / Azure AD / Keycloak>`
- Issuer URL: `<TBD: https://auth.example.com>`
- Audience (canonical resource URI): `<TBD: https://mcp.example.com/mcp>`
- Required scopes: `<TBD: e.g., mcp.tools.read mcp.tools.invoke>`
- Client registration: `<TBD: how clients onboard, who approves>`

## Observability

- Logs: `<TBD: Loki / Datadog / Splunk / Elastic>` -> dashboard `<TBD: link>`
- Metrics: Prometheus `<TBD: cluster name>` -> Grafana folder `<TBD: link>`
- Traces: `<TBD: Jaeger / Tempo / Honeycomb / Datadog APM>` -> service `<TBD: name>`
- On-call dashboard: `<TBD: bookmark URL>`

Standard alert routes:

| Alert | Routes to |
|---|---|
| Page (5xx burn, MCP down) | PagerDuty `<TBD: service>` |
| Ticket (latency, capacity) | `<TBD: Jira / Linear queue>` |
| Auth failure spike | Page + Slack `<TBD: #security>` |

## Top runbook entries

### `MCP unavailable` (page)

1. Check ingress controller pods: `kubectl -n ingress-nginx get pods`. If down, that's the bigger incident.
2. Check MCP pods: `kubectl -n mcp get pods`. Are any in CrashLoopBackOff?
3. `kubectl -n mcp logs deployment/mcp --since=10m` for stack traces.
4. If only one replica is bad, delete it: `kubectl -n mcp delete pod <pod>`.
5. If all replicas are bad and a deploy went out within the last 30 min: `helm -n mcp rollback mcp`.
6. If still down: page service owner.

### `Auth failure spike` (page)

1. Check `mcp_oauth_validation_failures_total` by reason in Grafana.
2. If `reason="signature"` is dominant: JWKS endpoint may be down. Verify `<TBD: issuer URL>/.well-known/jwks.json` returns 200.
3. If `reason="audience"` is dominant: a mis-configured client is sending tokens for the wrong resource. Check `User-Agent` distribution in logs.
4. If `reason="expiry"` is dominant and uniform: clock skew. Check NTP on cluster nodes.
5. If the spike correlates with a known IP range outside expected clients: possible attack. Engage security `<TBD: contact>`.

### `5xx burn rate` (page)

1. Find the dominant `mcp_name` driving errors: top-N panel in Grafana.
2. Check `request_duration_seconds` for that name. Slow + 5xx = downstream timeout.
3. Check downstream dependency (database, internal API) status pages.
4. If downstream is healthy, capture stack traces from logs and engage service owner.

### `p99 latency regression` (ticket)

1. Compare the regression window to the last deploy: `kubectl -n mcp rollout history deployment/mcp`.
2. Check CPU usage vs HPA target. If pegged: scale up `maxReplicas` or right-size the requests.
3. Compare per-tool latency; one expensive tool can dominate.

### `HPA at max` (ticket)

1. Confirm via Grafana that traffic actually justifies it.
2. If yes: bump `autoscaling.maxReplicas` in [`values.yaml`](../examples/helm/values.yaml).
3. If no: investigate per-pod CPU. Possible inefficiency or hot tool.

### `Sessions leaking` (ticket)

1. `mcp_session_count` should be roughly proportional to active clients.
2. If it grows unboundedly: the cleanup path on disconnect is broken.
3. For Redis sessions: scan `<TBD: SCAN MATCH session:* COUNT 100>` and check TTLs. Missing TTL = code bug.
4. Open a ticket for the service owner; meanwhile, increase Redis memory and run a janitor: `<TBD: command>`.

## Common manual operations

```powershell
# Tail logs
kubectl -n mcp logs deployment/mcp --since=10m -f

# Exec into a pod (bare-bones; distroless has no shell)
# Use ephemeral debug container instead:
kubectl -n mcp debug -it deployment/mcp --image=busybox --target=mcp

# Force a rolling restart (safe; respects PDB)
kubectl -n mcp rollout restart deployment/mcp

# Drain a node holding MCP pods
kubectl drain <node> --ignore-daemonsets --delete-emptydir-data

# Check HPA decisions
kubectl -n mcp describe hpa mcp

# Renew TLS cert (cert-manager)
kubectl -n mcp annotate certificate mcp-tls cert-manager.io/issue-temporary-certificate=true --overwrite
```

## Onboarding new clients

When a new internal team wants to call this MCP:

1. They register an OAuth client with `<TBD: issuer>` and request scopes from the catalog.
2. Approver: `<TBD>`.
3. Add their origin to `mcp.allowedOrigins` in [`values.yaml`](../examples/helm/values.yaml) and ship a Helm upgrade.
4. Send them the integration guide: `<TBD: link>`.

## Decommissioning

If retiring this MCP:

1. Notify all OAuth clients of the deprecation date (≥ 90 days notice).
2. Remove from MCP registry / discovery.
3. Drain traffic by removing the ingress route; keep pods running for a grace period.
4. After grace: `helm -n mcp uninstall mcp`, archive the repo, revoke OAuth client registration, delete secrets, archive logs per retention policy.

## Sign-offs

| Role | Person | Last reviewed |
|---|---|---|
| Service owner | `<TBD>` | `<TBD: YYYY-MM-DD>` |
| Security reviewer | `<TBD>` | `<TBD>` |
| On-call lead | `<TBD>` | `<TBD>` |

Re-review this runbook every quarter or after any significant incident.
