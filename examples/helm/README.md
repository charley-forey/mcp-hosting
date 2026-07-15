# Reference Helm chart

A working Helm chart that hosts a streamable HTTP MCP server on Kubernetes with the production posture described in [`docs/04-kubernetes-deep-dive.md`](../../docs/04-kubernetes-deep-dive.md).

## What's in the box

| File | Purpose |
|---|---|
| [`Chart.yaml`](Chart.yaml) | Chart metadata. |
| [`values.yaml`](values.yaml) | Heavily-commented reference values. Read this first. |
| [`templates/deployment.yaml`](templates/deployment.yaml) | Stateless Deployment with non-root container, OTel env vars, preStop drain hook. |
| [`templates/service.yaml`](templates/service.yaml) | ClusterIP service. |
| [`templates/serviceaccount.yaml`](templates/serviceaccount.yaml) | ServiceAccount with token auto-mount disabled. |
| [`templates/ingress.yaml`](templates/ingress.yaml) | ingress-nginx Ingress with SSE-safe annotations. |
| [`templates/hpa.yaml`](templates/hpa.yaml) | HPA on CPU with conservative scale-down to protect SSE streams. |
| [`templates/pdb.yaml`](templates/pdb.yaml) | PodDisruptionBudget. |
| [`templates/networkpolicy.yaml`](templates/networkpolicy.yaml) | Lock-down NetworkPolicy: only the ingress namespace may reach pods. |
| [`templates/configmap.yaml`](templates/configmap.yaml) | MCP-specific config surfaced as environment variables. |
| [`templates/servicemonitor.yaml`](templates/servicemonitor.yaml) | Prometheus Operator integration. |
| [`smoke-test.ps1`](smoke-test.ps1) | End-to-end test against a local `kind` cluster. |

## Deploy

```powershell
helm upgrade --install mcp ./examples/helm `
  -n mcp --create-namespace `
  --set image.repository=ghcr.io/your-org/your-mcp `
  --set image.tag=1.4.2
```

## Smoke-test locally

```powershell
pwsh ./examples/helm/smoke-test.ps1 `
  -ImageRepository ghcr.io/your-org/your-mcp `
  -ImageTag 0.1.0
```

This stands up a `kind` cluster, deploys the chart, port-forwards the Service, and POSTs a real MCP `initialize` request. PASS confirms the path Client -> Service -> Pod is intact.

## Lint without a cluster

```powershell
helm lint ./examples/helm
helm template my ./examples/helm | kubectl apply --dry-run=client -f -
```

## Required CRDs

`templates/servicemonitor.yaml` depends on the Prometheus Operator's `ServiceMonitor` CRD. If you don't run Prometheus Operator, set:

```yaml
observability:
  metrics:
    serviceMonitor:
      enabled: false
```

## What this chart does NOT do

- **Bundle Redis.** If you need stateful sessions, deploy Redis separately (Bitnami chart, an operator, or a managed service) and set `redis.url`.
- **Issue or rotate TLS certificates.** Use cert-manager (recommended) or an external certificate.
- **Manage OAuth client registration.** The chart accepts issuer URL and audience; you provision the OAuth app yourself.
- **Auto-derive `allowedOrigins`.** You list the trusted client origins explicitly to defend against DNS rebinding (see [`docs/06-security.md`](../../docs/06-security.md)).
