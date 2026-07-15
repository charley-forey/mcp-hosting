# Streamable HTTP MCP Hosting - Internal Handbook

A self-contained handbook on hosting **streamable HTTP MCP (Model Context Protocol) servers** for production use, with Kubernetes as the primary target and brief comparisons to managed alternatives. The handbook is paired with a curated, hashed corpus of cited external sources, original Mermaid diagrams, and a tested sample Helm deployment.

> **Audience.** Internal engineers who will host, deploy, secure, or operate MCP servers. Familiarity with HTTP, containers, and basic Kubernetes is assumed.

## What is in this repo

| Path | What it contains |
|---|---|
| [`docs/`](docs/) | The handbook itself, broken into numbered chapters. Read in order or jump in. |
| [`diagrams/`](diagrams/) | Mermaid sources and rendered SVG/PNG for every diagram in the handbook. |
| [`examples/`](examples/) | Tested, runnable Helm chart, TypeScript reference server, k6 load harness, K8s manifests, Dockerfile, and nginx ingress config. |
| [`sources/`](sources/) | Auditable evidence: cleaned Markdown snapshots of every cited external page, indexed in [`sources/_index.csv`](sources/_index.csv) with SHA256 and license metadata. |
| [`scripts/`](scripts/) | PowerShell utilities for fetching new sources, validating citations, and rendering diagrams. |
| [`.github/workflows/`](.github/workflows/) | CI workflows that self-verify docs, server quality, and kind-cluster smoke/load tests on PRs. |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Citation rules, source-tier policy, image-licensing policy. |

## Table of contents

1. [Overview](docs/01-overview.md) - What MCP is, why streamable HTTP, when to host vs consume.
2. [Transport architecture](docs/02-transport-architecture.md) - The `/mcp` endpoint, JSON vs SSE upgrade, SEP-2243 headers, lifecycle.
3. [Hosting options](docs/03-hosting-options.md) - Kubernetes vs Cloudflare Workers, Smithery, Cloud Run, Vercel.
4. [Kubernetes deep dive](docs/04-kubernetes-deep-dive.md) - Helm, Deployment, Service, Ingress, HPA, probes, PDB.
5. [Sessions and state](docs/05-sessions-and-state.md) - Stateless mode, JWT vs Redis, sticky sessions, scale-out trade-offs.
6. [Security](docs/06-security.md) - OAuth 2.1, TLS, mTLS, CORS, Origin validation, DNS rebinding, headers.
7. [Observability](docs/07-observability.md) - Structured logs, OpenTelemetry, health probes, RED metrics.
8. [Deployment checklist](docs/08-deployment-checklist.md) - Production readiness gates.
9. [Internal runbook](docs/09-internal-runbook.md) - Team-specific cluster, registry, CI, and secrets wiring.
10. [References](docs/10-references.md) - Annotated bibliography with attribution and license notes.
11. [How we test this handbook](docs/A1-how-we-test.md) - Executable validation pipeline (unit, smoke, load, CI).

## How to use this handbook

- **Reading.** Browse [`docs/`](docs/) in order, or jump to the chapter relevant to your task. Every normative claim carries an inline citation tag like `[src: spec-transports]` that resolves to a row in [`sources/_index.csv`](sources/_index.csv).
- **Adding a source.** Run `pwsh ./scripts/fetch-source.ps1 -Url <url>`. The script downloads the page, cleans it to Markdown under [`sources/pages/`](sources/pages/), records SHA256 and license metadata, and appends a row to [`sources/_index.csv`](sources/_index.csv).
- **Validating citations.** Run `pwsh ./scripts/validate-claims.ps1`. It lints every `[src: <id>]` tag in `docs/` against the index and warns on stale rows.
- **Rendering diagrams.** Run `pwsh ./scripts/render-diagrams.ps1` to regenerate SVG/PNG from `.mmd` sources (requires `@mermaid-js/mermaid-cli` on PATH).
- **Running the example.** See [`examples/helm/README.md`](examples/helm/README.md) for the kind/minikube smoke test.

## Running the reference server

- **Reference server:** [`examples/server/`](examples/server/) contains the TypeScript Streamable HTTP MCP used by CI and smoke tests.
- **Load test harness:** [`examples/load/k6-streamable.js`](examples/load/k6-streamable.js) exercises initialize burst, steady tool calls, and SSE behavior with explicit thresholds.
- **Smoke tests:** both PowerShell and bash scripts are available:
  - [`examples/helm/smoke-test.ps1`](examples/helm/smoke-test.ps1)
  - [`examples/helm/smoke-test.sh`](examples/helm/smoke-test.sh)
- **CI pipeline docs:** [`docs/A1-how-we-test.md`](docs/A1-how-we-test.md) explains what each workflow enforces.

## Quick links

- [Production readiness checklist](docs/08-deployment-checklist.md)
- [Hosting decision matrix](docs/03-hosting-options.md#decision-matrix)
- [Streamable HTTP flow diagram](diagrams/streamable-http-flow.mmd)
- [Reference Helm `values.yaml`](examples/helm/values.yaml)

## Status

This handbook tracks a fast-moving spec. Every chapter cites the spec version it was written against, and the source index records the date each external page was fetched. Re-run `fetch-source.ps1` periodically to detect drift via SHA256 hash.
