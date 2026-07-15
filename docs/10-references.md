# 10. References

Annotated bibliography for every source cited in this handbook. Each row corresponds to a slug in [`sources/_index.csv`](../sources/_index.csv) and a cleaned Markdown snapshot in [`sources/pages/`](../sources/pages/). The handbook's `[src: <slug>]` tags resolve to the entries below.

> **Reproducibility**: every snapshot was fetched on 2026-04-30 and hashed with SHA256. Re-run [`scripts/fetch-source.ps1`](../scripts/fetch-source.ps1) to detect drift; the script preserves the previous hash in the `notes` column when content changes.

## Tier 1 - Specification

These are the authoritative sources. All other citations defer to these on points of conflict.

| Slug | Source | Used in |
|---|---|---|
| `spec-transports` | [Transports - Model Context Protocol](https://modelcontextprotocol.io/specification/2025-06-18/basic/transports), MCP spec 2025-06-18. The single source of truth for streamable HTTP transport: endpoint, headers, sessions, resumability, lifecycle. [src: spec-transports] | [01](01-overview.md), [02](02-transport-architecture.md), [05](05-sessions-and-state.md), [06](06-security.md), [08](08-deployment-checklist.md) |
| `spec-sep-2243` | [SEP-2243: HTTP Header Standardization for Streamable HTTP Transport](https://modelcontextprotocol.io/seps/2243-http-standardization). Final 2026-02-04. Defines `Mcp-Method` and `Mcp-Name` headers, header/body consistency rules. [src: spec-sep-2243] | [01](01-overview.md), [02](02-transport-architecture.md), [06](06-security.md), [07](07-observability.md), [08](08-deployment-checklist.md) |
| `spec-authorization` | [Authorization - Model Context Protocol](https://modelcontextprotocol.io/specification/2025-06-18/basic/authorization). OAuth 2.1, RFC 8414, RFC 8707, PKCE, audience validation, token passthrough rules. [src: spec-authorization] | [04](04-kubernetes-deep-dive.md), [06](06-security.md), [08](08-deployment-checklist.md) |
| `spec-lifecycle` | [Lifecycle - Model Context Protocol](https://modelcontextprotocol.io/specification/2025-06-18/basic/lifecycle). Initialize handshake, version negotiation, capability declaration. [src: spec-lifecycle] | [02](02-transport-architecture.md) |
| `spec-architecture` | [Architecture - Model Context Protocol](https://modelcontextprotocol.io/specification/2025-06-18/architecture). High-level client/server model, capability surface (tools, resources, prompts, etc.). [src: spec-architecture] | [01](01-overview.md) |
| `spec-registry-remote` | [Publishing Remote Servers - Model Context Protocol](https://modelcontextprotocol.io/registry/remote-servers). What it takes to publish to the public registry. [src: spec-registry-remote] | [01](01-overview.md) |
| `spec-rfc-206-streamable-http` | [PR #206: Replace HTTP+SSE with new "Streamable HTTP" transport](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/206/files). The RFC that introduced the transport. Useful background on the design trade-offs. [src: spec-rfc-206-streamable-http] | [01](01-overview.md), [02](02-transport-architecture.md), [03](03-hosting-options.md) |

## Tier 2 - SDK and framework documentation

First-party guides for building MCP clients and servers.

| Slug | Source | Used in |
|---|---|---|
| `sdk-openai-agents-mcp` | [Model Context Protocol (MCP) | OpenAI Agents SDK](https://openai.github.io/openai-agents-js/guides/mcp). Client integration patterns, transport selection guidance. [src: sdk-openai-agents-mcp] | [01](01-overview.md), [03](03-hosting-options.md) |
| `sdk-dapr-mcp` | [MCP | Dapr Docs](https://docs.dapr.io/developing-ai/mcp/_print/). How Dapr's runtime abstractions map onto MCP capabilities. Background reference for teams that have Dapr in their stack. [src: sdk-dapr-mcp] | (background) |
| `sdk-mcp-oauth-blueprint` | [huberp/mcp-oauth-mcpserver-blueprint](https://github.com/huberp/mcp-oauth-mcpserver-blueprint). Reference Java/Spring implementation of an OAuth-enabled MCP server. Useful when you need a working example of RFC 8414 metadata + RFC 8707 resource indicators. [src: sdk-mcp-oauth-blueprint] | [04](04-kubernetes-deep-dive.md), [05](05-sessions-and-state.md), [06](06-security.md) |

## Tier 3 - Kubernetes and cloud how-tos

Practitioner guides specifically about deploying MCPs on infrastructure.

| Slug | Source | Used in |
|---|---|---|
| `k8s-tmdevlab-scalable` | [Production-Ready MCP #1: From Localhost to Production on Kubernetes (TM Dev Lab)](https://www.tmdevlab.com/scalable-mcp-servers-kubernetes.html). Architecture patterns, ingress-nginx buffering deep dive, NetworkPolicy guidance. [src: k8s-tmdevlab-scalable] | [03](03-hosting-options.md), [04](04-kubernetes-deep-dive.md), [05](05-sessions-and-state.md), [07](07-observability.md), [08](08-deployment-checklist.md) |
| `k8s-skywork-helm` | [How to Deploy and Operate an MCP Server on Kubernetes with Helm (Skywork)](https://skywork.ai/blog/how-to-deploy-operate-mcp-server-kubernetes-helm-guide/). Concrete `values.yaml` for the chatmcp Helm chart, dev vs prod profiles. [src: k8s-skywork-helm] | [03](03-hosting-options.md), [04](04-kubernetes-deep-dive.md), [08](08-deployment-checklist.md) |
| `k8s-paularlott-mcp` | [paularlott/mcp - GitHub](https://github.com/paularlott/mcp). Go MCP framework with a session-server example. Useful for the JWT session pattern. [src: k8s-paularlott-mcp] | [05](05-sessions-and-state.md) |

## Tier 4 - Production guides and platform comparisons

Synthesis articles. Treated as evidence; cited in pairs where used as primary support.

| Slug | Source | Used in |
|---|---|---|
| `prod-mcpcat-config` | [Configure MCP Servers for Production - Best Practices (MCPcat)](https://mcpcat.io/guides/configuring-mcp-installations-production). Covers TLS, OAuth, secrets, rate limiting, security headers. [src: prod-mcpcat-config] | [03](03-hosting-options.md), [04](04-kubernetes-deep-dive.md), [05](05-sessions-and-state.md), [06](06-security.md), [07](07-observability.md), [08](08-deployment-checklist.md) |
| `prod-mcpcat-streamable` | [Build StreamableHTTP MCP Servers - Production Guide (MCPcat)](https://mcpcat.io/guides/building-streamablehttp-mcp-server/). Code patterns, CORS/Origin validation, security headers, session timeouts. [src: prod-mcpcat-streamable] | [03](03-hosting-options.md), [06](06-security.md), [08](08-deployment-checklist.md) |
| `prod-systemprompt-deploy` | [MCP Servers in Production (systemprompt.io)](https://systemprompt.io/guides/mcp-servers-production-deployment). Container hardening, graceful shutdown, monitoring, the "what no tutorial tells you" gaps. [src: prod-systemprompt-deploy] | [03](03-hosting-options.md), [04](04-kubernetes-deep-dive.md), [06](06-security.md), [07](07-observability.md), [08](08-deployment-checklist.md) |
| `prod-fordel-mcp` | [Building Production MCP Servers (Fordel Studios)](https://fordelstudios.com/research/building-production-mcp-servers). Strong section on JWT-based stateless sessions and revocation trade-offs. [src: prod-fordel-mcp] | [03](03-hosting-options.md), [05](05-sessions-and-state.md), [08](08-deployment-checklist.md) |
| `prod-medium-streamable` | [Implementing MCP with Streamable HTTP Transport in prod (Medium)](https://medium.com/ai-in-plain-english/implementing-mcp-with-streamable-http-transport-in-prod-23ca9c6731ca). Implementation walk-through; useful for cross-checking session-store patterns. [src: prod-medium-streamable] | [05](05-sessions-and-state.md) |
| `cloud-ekamoira-deploy` | [Deploy MCP Servers to Production: Cloud Guide (Ekamoira)](https://www.ekamoira.com/blog/mcp-servers-cloud-deployment-guide). Cloud Run, AWS, container app comparisons. [src: cloud-ekamoira-deploy] | [03](03-hosting-options.md) |
| `cloud-mcpplayground-free` | [Where to Host MCP Servers for Free: Cloudflare, Vercel, and More (MCP Playground)](https://mcpplaygroundonline.com/blog/free-mcp-server-hosting-cloudflare-vercel-guide). Free-tier limits, function-duration limits. [src: cloud-mcpplayground-free] | [03](03-hosting-options.md) |
| `compare-athenic-providers` | [MCP Server Providers: Complete 2026 Comparison Guide (Athenic)](https://getathenic.com/blog/mcp-server-providers-comparison-2026). Pricing, security incidents, edge cold-start data. [src: compare-athenic-providers] | [03](03-hosting-options.md), [06](06-security.md) |
| `compare-fastio-platforms` | [Best MCP Hosting Platforms for AI Agents 2026 (Fastio)](https://fast.io/resources/best-mcp-hosting-platforms/). Cross-vendor benchmark for the comparison matrix. [src: compare-fastio-platforms] | [03](03-hosting-options.md) |

## How to update this corpus

```powershell
# Re-fetch a source (drift is detected and reported automatically):
pwsh ./scripts/fetch-source.ps1 -Url <url> -Slug <slug> -Tier <1-4> -License <id>

# Add a new source (uses the same command; new slugs append to the index):
pwsh ./scripts/fetch-source.ps1 -Url <new-url> -Slug <new-slug> -Tier 4 -License "blog-fair-use"

# Validate every citation in docs/ resolves to the index:
pwsh ./scripts/validate-claims.ps1
```

The validator's recency gate flags rows older than 365 days. When that fires, re-fetch and update the chapter's claims if anything material has changed in the source. Notes in `sources/_index.csv` record prior hashes for drift detection.
