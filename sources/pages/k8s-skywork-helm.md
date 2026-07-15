---
slug: k8s-skywork-helm
url: https://skywork.ai/blog/how-to-deploy-operate-mcp-server-kubernetes-helm-guide/
title: How to Deploy and Operate an MCP Server on Kubernetes with Helm
author: andywang
fetched_at: 2026-04-30T20:52:56Z
sha256: af9cfaeeb4b98950c2bcee12a361a80c06baf7a91adab27b3ce7f54aba8c8129
license: blog-fair-use
tier: 3
---
- How to Deploy and Operate an MCP Server on Kubernetes with Helm

 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 

 Skip to content

 
 

 
# How to deploy and operate an MCP server on Kubernetes using the mcp-server-chart (Helm)
 
 [Leave a Comment](https://skywork.ai/blog/how-to-deploy-operate-mcp-server-kubernetes-helm-guide/#respond) 

 / [Mcp server](https://skywork.ai/blog/category/mcp-server/) / By [andywang](https://skywork.ai/blog/author/andywang/)
 

 
 
 [https://www.facebook.com/sharer.php?u=https%3A%2F%2Fskywork.ai%2Fblog%2Fhow-to-deploy-operate-mcp-server-kubernetes-helm-guide%2F](https://www.facebook.com/sharer.php?u=https%3A%2F%2Fskywork.ai%2Fblog%2Fhow-to-deploy-operate-mcp-server-kubernetes-helm-guide%2F)
 [http://twitter.com/share?url=https%3A%2F%2Fskywork.ai%2Fblog%2Fhow-to-deploy-operate-mcp-server-kubernetes-helm-guide%2F&text=How%20to%20deploy%20and%20operate%20an%20MCP%20server%20on%20Kubernetes%20using%20the%20mcp-server-chart%20%28Helm%29&hashtags=Mcp%20server](http://twitter.com/share?url=https%3A%2F%2Fskywork.ai%2Fblog%2Fhow-to-deploy-operate-mcp-server-kubernetes-helm-guide%2F&text=How%20to%20deploy%20and%20operate%20an%20MCP%20server%20on%20Kubernetes%20using%20the%20mcp-server-chart%20%28Helm%29&hashtags=Mcp%20server)
 [https://pinterest.com/pin/create/bookmarklet/?media=https://blog-cdn.skywork.ai/wp-content/uploads/2025/09/e2c11c494935445c8ed4f9ed9cd39652.jpg&url=https%3A%2F%2Fskywork.ai%2Fblog%2Fhow-to-deploy-operate-mcp-server-kubernetes-helm-guide%2F&description=How%20to%20deploy%20and%20operate%20an%20MCP%20server%20on%20Kubernetes%20using%20the%20mcp-server-chart%20(Helm)](https://pinterest.com/pin/create/bookmarklet/?media=https://blog-cdn.skywork.ai/wp-content/uploads/2025/09/e2c11c494935445c8ed4f9ed9cd39652.jpg&url=https%3A%2F%2Fskywork.ai%2Fblog%2Fhow-to-deploy-operate-mcp-server-kubernetes-helm-guide%2F&description=How%20to%20deploy%20and%20operate%20an%20MCP%20server%20on%20Kubernetes%20using%20the%20mcp-server-chart%20(Helm))
 [https://www.linkedin.com/shareArticle?mini=true&url=https%3A%2F%2Fskywork.ai%2Fblog%2Fhow-to-deploy-operate-mcp-server-kubernetes-helm-guide%2F&title=How+to+deploy+and+operate+an+MCP+server+on+Kubernetes+using+the+mcp-server-chart+%28Helm%29&source=Skywork+ai](https://www.linkedin.com/shareArticle?mini=true&url=https%3A%2F%2Fskywork.ai%2Fblog%2Fhow-to-deploy-operate-mcp-server-kubernetes-helm-guide%2F&title=How+to+deploy+and+operate+an+MCP+server+on+Kubernetes+using+the+mcp-server-chart+%28Helm%29&source=Skywork+ai)
 
 
 

 
 
 

 
 
 
 
 

 

 
 
 

 
 

 
 
 
 

 
 

Deploy a production-grade MCP (Model Context Protocol) server to Kubernetes using Helm, then harden, scale, and troubleshoot it with confidence. We’ll resolve the common chart-naming confusion up front, give you copy‑paste commands, and show you how to verify the deployment end‑to‑end.

Estimated time: 45–90 minutes overall (10–15 minutes for quickstart)
Difficulty: Intermediate (Helm/Kubernetes familiarity recommended)
Assumptions: Vanilla Kubernetes and Helm 3, cluster-admin for initial setup, a DNS hostname, and optionally an Ingress controller and TLS certificates.

Note on naming: “mcp-server-chart” is often used informally. In this guide, we’ll use the community Helm chart from the chatmcp organization as the primary example and recognize alternatives later. Keys and options differ across charts—always confirm in the selected chart’s values.yaml before applying examples.

According to the official MCP transports guidance, Streamable HTTP is the modern standard and replaces legacy SSE-first patterns beginning with the 2025-03-26 protocol version, as outlined in the [Transports concepts page (Model Context Protocol, 2025)](https://modelcontextprotocol.io/docs/concepts/transports) and the [2025-03-26 transports specification](https://modelcontextprotocol.io/specification/2025-03-26/basic/transports). We’ll use that context for ingress and keep-alive settings.

## Before you begin

Kubernetes: 1.27–1.30+ recommended

- Helm: 3.14+

- Tools: kubectl and helm CLI

- Access: Cluster-admin for initial namespace/chart setup

- Optional components:

Ingress controller (e.g., ingress-nginx or Gateway API)

- cert-manager for automated TLS

- A DNS hostname (e.g., mcp.example.com)

High‑risk checkpoints to keep in mind:

- TLS and authentication headers/tokens

- Secrets handling (do not store secrets in plaintext values files)

- RBAC least privilege for any tool-executing behavior

- Ingress timeouts and buffering for streaming

- Probe alignment (path/port/initial delays)

## Pick a chart and clear the naming ambiguity

Primary example (used below): **[chatmcp/mcp-helm-chart on GitHub](https://github.com/chatmcp/mcp-helm-chart)**

Alternative: **[cowboysysop/kubernetes-mcp on Artifact Hub](https://artifacthub.io/packages/helm/cowboysysop/kubernetes-mcp)**

Keys differ between charts. This guide’s values examples target the chatmcp chart; adapt as needed if you choose the alternative.

## Quickstart (dev/test): install and verify in minutes

- Create a namespace and add the Helm repo.

```
kubectl create namespace mcp
helm repo add chatmcp https://chatmcp.github.io/mcp-helm-chart
helm repo update
```

- Prepare a minimal values file for dev.

```
# values.dev.yaml
image:
 repository: ghcr.io/chatmcp/mcp-server
 tag: v0.1.0 # choose a real tag from the chart docs/repo
 pullPolicy: IfNotPresent

service:
 type: ClusterIP
 port: 8080

# Enable basic env variables; do not put secrets here in plaintext
env:
 - name: LOG_LEVEL
 value: info

resources:
 requests:
 cpu: 200m
 memory: 256Mi
 limits:
 cpu: "1"
 memory: 1Gi

# Simple readiness/liveness probes (align path/port with your server)
probes:
 liveness:
 httpGet:
 path: /health
 port: 8080
 initialDelaySeconds: 10
 readiness:
 httpGet:
 path: /health
 port: 8080
 initialDelaySeconds: 5
```

- Install the chart.

```
helm install mcp chatmcp/mcp-server -n mcp -f values.dev.yaml
```

- Verify pods and service.

```
kubectl get pods -n mcp
kubectl describe pod -n mcp -l app.kubernetes.io/name=mcp-server
kubectl get svc -n mcp
```

Expect the pod to show Ready 1/1 and the Service to listen on port 8080 (or the port you configured).

- Port-forward and test the MCP endpoint locally.

```
kubectl -n mcp port-forward svc/mcp-server 8080:8080
```

In another terminal, send a simple JSON-RPC request (tools list is a common handshake):

```
curl -sS http://localhost:8080/mcp 
 -H "Content-Type: application/json" 
 -X POST 
 -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

You should receive a JSON-RPC 2.0 response with available tools. For server semantics and a minimal “build a server” example, see the **[Quickstart server page on modelcontextprotocol.io (2025)](https://modelcontextprotocol.io/quickstart/server)**.

## Production configuration: secure ingress, streaming, and hardening

The following values are a starting point for production. Adjust keys to match your chart.

```
# values.prod.yaml
image:
 repository: ghcr.io/chatmcp/mcp-server
 tag: v0.1.0
 pullPolicy: IfNotPresent

replicaCount: 2

service:
 type: ClusterIP
 port: 8080

ingress:
 enabled: true
 className: nginx
 hosts:
 - host: mcp.example.com
 paths:
 - path: /
 pathType: Prefix
 tls:
 - hosts:
 - mcp.example.com
 secretName: mcp-tls
 annotations:
 # Streaming-friendly settings for ingress-nginx
 nginx.ingress.kubernetes.io/proxy-buffering: "off"
 nginx.ingress.kubernetes.io/proxy-read-timeout: "3600"
 nginx.ingress.kubernetes.io/proxy-send-timeout: "3600"
 nginx.ingress.kubernetes.io/proxy-http-version: "1.1"
 nginx.ingress.kubernetes.io/configuration-snippet: |
 proxy_set_header X-Accel-Buffering no;

env:
 - name: LOG_LEVEL
 value: info
 # Consume tokens/certs via Secrets mounted by the chart or extra manifests
 # - name: AUTH_TOKEN
 # valueFrom: # see your chart’s pattern for secretRefs

resources:
 requests:
 cpu: 500m
 memory: 512Mi
 limits:
 cpu: "2"
 memory: 2Gi

securityContext:
 runAsNonRoot: true
 runAsUser: 1000
 readOnlyRootFilesystem: true
 allowPrivilegeEscalation: false
 capabilities:
 drop: ["ALL"]

probes:
 startup:
 httpGet:
 path: /health
 port: 8080
 failureThreshold: 30
 periodSeconds: 10
 liveness:
 httpGet:
 path: /health
 port: 8080
 initialDelaySeconds: 20
 periodSeconds: 10
 readiness:
 httpGet:
 path: /health
 port: 8080
 initialDelaySeconds: 10
 periodSeconds: 5

autoscaling:
 enabled: true
 minReplicas: 2
 maxReplicas: 10
 targetCPUUtilizationPercentage: 75
```

Key notes:

- Streamable HTTP: Modern MCP servers use a single HTTP endpoint for JSON‑RPC requests and streaming responses. Disable buffering and raise timeouts to avoid disconnects; see the ingress‑nginx annotations documented under [proxy‑buffering and timeouts (ingress-nginx docs)](https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/annotations/#proxy-buffering).

- TLS: Terminate at the ingress with a certificate; automate with cert-manager if available. If your client requires mTLS, configure it at the ingress or service mesh layer.

- Secrets: Inject tokens, API keys, or encryption materials via Kubernetes Secrets mounted or referenced by the chart. Avoid plaintext in Git or values files.

- Probes: Ensure paths and ports match your MCP server. For probe strategy and semantics, refer to [Kubernetes probes concepts (docs, 2025)](https://kubernetes.io/docs/concepts/configuration/liveness-readiness-startup-probes/).

Apply and verify:

```
helm upgrade --install mcp chatmcp/mcp-server -n mcp -f values.prod.yaml
kubectl get ingress -n mcp
kubectl get pods -n mcp
```

Test through the public hostname:

```
curl -sS https://mcp.example.com/mcp 
 -H "Content-Type: application/json" 
 -X POST 
 -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

If your client uses auth headers, add them to the curl command and configure the chart to read the token from a Secret.

## Security hardening essentials

- Pod Security Standards (Restricted): Label the namespace to enforce restricted defaults such as non‑root user, no privilege escalation, and read‑only root filesystem. Example:

```
kubectl label namespace mcp 
 pod-security.kubernetes.io/enforce=restricted 
 pod-security.kubernetes.io/warn=restricted 
 pod-security.kubernetes.io/audit=restricted
```

Learn more in **[Kubernetes Pod Security Admission (docs)](https://kubernetes.io/docs/concepts/security/pod-security-admission/)**.

- RBAC least privilege: Grant only the verbs/resources your server truly needs. Example (namespace‑scoped read of ConfigMaps/Secrets):

```
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
 name: mcp-app
 namespace: mcp
rules:
 - apiGroups: [""]
 resources: ["configmaps", "secrets"]
 verbs: ["get"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
 name: mcp-app-bind
 namespace: mcp
subjects:
 - kind: ServiceAccount
 name: mcp-sa
 namespace: mcp
roleRef:
 kind: Role
 name: mcp-app
 apiGroup: rbac.authorization.k8s.io
```

- Network policy: Restrict ingress to trusted clients and egress to only required external services. Start with a default‑deny egress and open destinations explicitly.

- Secrets hygiene: Use Kubernetes Secrets (type Opaque/TLS). Prefer mounting as files or environment variables sourced from Secrets—avoid placing sensitive values directly in Helm values.

## Observability: logs, metrics, tracing

- Logs: Emit structured logs (JSON) at a practical level (info in prod, debug only for troubleshooting). Ship to your cluster logging stack.

- Metrics: If your server exposes /metrics, integrate with Prometheus Operator via a ServiceMonitor. See the [ServiceMonitor API reference (Prometheus Operator)](https://prometheus-operator.dev/docs/api-reference/api/#servicemonitor). Minimal example:

```
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
 name: mcp
 namespace: monitoring
 labels:
 release: prometheus
spec:
 selector:
 matchLabels:
 app.kubernetes.io/name: mcp-server
 namespaceSelector:
 matchNames:
 - mcp
 endpoints:
 - port: http
 path: /metrics
 interval: 30s
```

- Tracing: If supported, wire OpenTelemetry exporters. Otherwise, consider sidecar or proxy approaches for distributed tracing.

## Scaling and performance

- Replicas and HPA: Start with 2 replicas for HA and enable HPA on CPU (and/or custom app metrics if available).

```
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
 name: mcp
 namespace: mcp
spec:
 scaleTargetRef:
 apiVersion: apps/v1
 kind: Deployment
 name: mcp-server
 minReplicas: 2
 maxReplicas: 10
 metrics:
 - type: Resource
 resource:
 name: cpu
 target:
 type: Utilization
 averageUtilization: 75
```

- Resources: Tune requests/limits to avoid OOM and throttling. Streaming responses can be memory‑intensive; leave headroom.

- Session behavior: If the server maintains state per connection, consider stickiness at the ingress; stateless designs scale more easily with Streamable HTTP.

## Upgrades, rollbacks, and DR

- Pin versions: Specify chart and image tags in values files and record them in Git.

- Upgrade:

```
helm upgrade mcp chatmcp/mcp-server -n mcp -f values.prod.yaml
```

- Rollback:

```
helm history mcp -n mcp
helm rollback mcp -n mcp
```

- Canary/blue‑green: Use a separate Helm release or weighted ingress routing. Validate health checks and logs before full cutover.

- Backup/DR: Back up ConfigMaps, Secrets, and Helm release state. Keep your values files in source control and rehearse restore procedures.

## Connect a client (Claude and others)

Most clients point to an MCP HTTP endpoint with optional headers/tokens. For example, Claude Desktop/Server can be configured to talk to a remote MCP server; see the **[Claude Docs MCP page (Anthropic, 2025)](https://docs.claude.com/en/docs/mcp)** for client specifics.

Example request schema for verification (conceptual): JSON‑RPC 2.0 with fields jsonrpc, id, method, params. A tools/list call should return available tools.

## Verification workflow: what good looks like

After a production install:

```
kubectl get pods -n mcp
kubectl get svc,ingress -n mcp
kubectl logs -n mcp -l app.kubernetes.io/name=mcp-server --tail=100
```

- Pods: Ready for all replicas; probes passing.

- Service: Correct port; Ingress hostname resolves.

- Curl tools list succeeds with 200 OK and a JSON‑RPC response.

- Long‑running requests stream without buffering delays or premature timeouts.

## Troubleshooting

- Pods CrashLoopBackOff

Check logs: `kubectl logs -n mcp `

- Confirm image tag and startup arguments; verify Secrets are present and mounted.

- Align probe paths/ports; increase initialDelaySeconds if startup is slow.

- 4xx/5xx via Ingress

Validate host/path/class; confirm Service port matches backend.

- Check TLS Secret exists and is valid; reissue if expired.

- Ensure annotations disable buffering and extend timeouts for streaming.

- Streaming disconnects or idle timeouts

Increase proxy-read/send-timeout at ingress; disable proxy buffering; prefer HTTP/1.1 for chunked streaming.

- Check cloud load balancer/WAF idle timeout policies.

- RBAC denied

Use `kubectl auth can-i --as=system:serviceaccount:mcp:mcp-sa get secrets -n mcp` to test permissions.

- Bind a scoped Role/RoleBinding; avoid cluster‑admin.

- DNS or egress blocked

Review NetworkPolicies; allow egress to needed APIs/domains.

- Test with `nslookup` or `curl` from a debug pod.

- Readiness never true

Confirm /health endpoint exists; match probe port/path; increase delays.

## Ecosystem and alternatives

- Primary chart used in this guide: [chatmcp/mcp-helm-chart](https://github.com/chatmcp/mcp-helm-chart)

- Alternative chart: [cowboysysop/kubernetes-mcp (Artifact Hub)](https://artifacthub.io/packages/helm/cowboysysop/kubernetes-mcp)

- Protocol and transport context: [Transports concepts (Model Context Protocol, 2025)](https://modelcontextprotocol.io/docs/concepts/transports) and [2025-03-26 transports spec](https://modelcontextprotocol.io/specification/2025-03-26/basic/transports)

- Kubernetes security and health references: [Pod Security Admission (docs)](https://kubernetes.io/docs/concepts/security/pod-security-admission/) and [Probes (docs)](https://kubernetes.io/docs/concepts/configuration/liveness-readiness-startup-probes/)

- Streaming‑friendly ingress guidance: [ingress‑nginx annotations](https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/annotations/#proxy-buffering)

- Metrics integration: [ServiceMonitor API (Prometheus Operator)](https://prometheus-operator.dev/docs/api-reference/api/#servicemonitor)

- Client integration reference: [Claude Docs MCP (Anthropic, 2025)](https://docs.claude.com/en/docs/mcp)

## Final checklist

- You can curl the MCP endpoint and see a JSON‑RPC tools list response.

- Ingress TLS is valid; streaming requests don’t buffer or time out early.

- Pods run as non‑root with restricted security context; RBAC is scoped.

- HPA scales replicas under load; probes protect availability.

- Metrics and logs flow into your observability stack.

- Upgrade and rollback are rehearsed; backups exist for ConfigMaps/Secrets/values.

If you need a different chart, swap in the alternative and re-map keys to your values files. Each chart’s README and values.yaml are the source of truth for configuration details.

 Post Views: 79
 
 
 
 

 

 
### About The Author
 [#### andywang](https://skywork.ai/blog/author/andywang/) 
 
 
 
 
 
 
 
 
 
 
 
 
## Related Posts
 
 
 
 [https://skywork.ai/blog/mcp-server-splunk-mcp-llm-splunk-integration/](https://skywork.ai/blog/mcp-server-splunk-mcp-llm-splunk-integration/) 
 
 
 
 
 
 
 
 
 [https://skywork.ai/blog/how-to-install-jira-mcp-server-connect-claude-desktop-guide/](https://skywork.ai/blog/how-to-install-jira-mcp-server-connect-claude-desktop-guide/) 
 
 
 
 
 
 
 
 
 [https://skywork.ai/blog/mcp-synolink-definition-mcp-server-synology-nas/](https://skywork.ai/blog/mcp-synolink-definition-mcp-server-synology-nas/) 
 
 
 
 
 
 
 
 
 [https://skywork.ai/blog/visiomcp-mcp-server-review-2025/](https://skywork.ai/blog/visiomcp-mcp-server-review-2025/) 
 
 
 
 
 
 
 
 
 [https://skywork.ai/blog/mcp-synolink-mcp-server-synology-nas-ai/](https://skywork.ai/blog/mcp-synolink-mcp-server-synology-nas-ai/) 
 
 
 
 
 
 
 
 
 [https://skywork.ai/blog/how-to-set-up-mcp-server-datadog-guide/](https://skywork.ai/blog/how-to-set-up-mcp-server-datadog-guide/) 
 
 
 
 
 
 
 
 
 [https://skywork.ai/blog/splunk-mcp-mcp-server-definition/](https://skywork.ai/blog/splunk-mcp-mcp-server-definition/) 
 
 
 
 
 
 
 
 
 [https://skywork.ai/blog/visiomcp-mcp-server-review-visio-automation-2025/](https://skywork.ai/blog/visiomcp-mcp-server-review-visio-automation-2025/) 
 
 
 
 
 
 
 
 
 [https://skywork.ai/blog/how-to-install-configure-mcp-server-datadog-guide/](https://skywork.ai/blog/how-to-install-configure-mcp-server-datadog-guide/) 
 
 
 
 
 
 
 
 
 [https://skywork.ai/blog/how-to-mcp-server-datadog-install-claude-desktop-guide/](https://skywork.ai/blog/how-to-mcp-server-datadog-install-claude-desktop-guide/) 
 
 
 
 
 
 
 
 
 [https://skywork.ai/blog/mcp-synolink-synology-nas-ai-assistant-server/](https://skywork.ai/blog/mcp-synolink-synology-nas-ai-assistant-server/) 
 
 
 
 
 
 
 
 
 [https://skywork.ai/blog/mcp-server-mcp-synolink-synology/](https://skywork.ai/blog/mcp-server-mcp-synolink-synology/) 
 
 
 
 
 
 
 
 
 [https://skywork.ai/blog/mcp-server-mcp-synolink-synology-2/](https://skywork.ai/blog/mcp-server-mcp-synolink-synology-2/) 
 
 
 
 
 
 
 
 
 [https://skywork.ai/blog/mcp-server-framer-plugin-mcp-explained/](https://skywork.ai/blog/mcp-server-framer-plugin-mcp-explained/) 
 
 
 
 
 
 
 
 
 [https://skywork.ai/blog/mcp-server-mcp-ocr-ocr-ai-integration/](https://skywork.ai/blog/mcp-server-mcp-ocr-ocr-ai-integration/) 
 
 
 
 
 
 
 
 
 [https://skywork.ai/blog/how-to-set-up-mcp-server-home-assistant-mcp-agent/](https://skywork.ai/blog/how-to-set-up-mcp-server-home-assistant-mcp-agent/) 
 
 
 
 
 
 
 
 
 
 
 
 
### Leave a Comment Cancel Reply
 
 
 

 
 
 
 

 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 [Get 500 Free Credits of Skywork](http://skywork.ai/?scid=blog_header)[Get 500 Free Credits of Skywork](http://skywork.ai/?scid=blog_header) 
 
 
 
 
 
 
 
 

 
 
 
 Ask Skywork AI about this article

 
 
 
 Click to get more info about this article
 
 
 

 

 
 

 

 
 
 
 
 
 Congratulations! You’ve received 500 Free Credits

 [Click to Get Now!](https://skywork.ai/sku?rechargeFrom=credit_details&scid=blog_pop1113)

 

 
 
 
 

 

 
 
 
 
 

## Congratulations!
 You’ve received 500 Free Credits

- ALL IN ONE AI Office Tools Intergration

- 200+ Templates, One-Click PPT Generation

- 300+ Professional And Realtime Database

[Get Free Credits Now!](https://skywork.ai/sku?rechargeFrom=credit_details&scid=blog_pop1113)

 🔥 Only 99 members left! ⏳ Offer ends in

 10:00:000
