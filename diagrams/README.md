# Diagram sources

Every diagram in this handbook lives here as Mermaid source so it diffs cleanly and re-renders consistently. The same Mermaid blocks are also embedded inline in the corresponding chapter under [`docs/`](../docs/) so they render in GitHub/GitLab without a build step.

| File | Used by |
|---|---|
| [`streamable-http-flow.mmd`](streamable-http-flow.mmd) | [docs/02-transport-architecture.md](../docs/02-transport-architecture.md) |
| [`k8s-topology.mmd`](k8s-topology.mmd) | [docs/04-kubernetes-deep-dive.md](../docs/04-kubernetes-deep-dive.md) |
| [`session-decision-tree.mmd`](session-decision-tree.mmd) | [docs/05-sessions-and-state.md](../docs/05-sessions-and-state.md) |
| [`oauth-flow.mmd`](oauth-flow.mmd) | [docs/06-security.md](../docs/06-security.md) |
| [`source-pipeline.mmd`](source-pipeline.mmd) | [README.md](../README.md), [CONTRIBUTING.md](../CONTRIBUTING.md) |

## Rendering to SVG/PNG

```powershell
npm install -g @mermaid-js/mermaid-cli
pwsh ../scripts/render-diagrams.ps1
```

The script is a no-op when `mmdc` is not installed, so it's safe to run in CI environments without Node.

## Why Mermaid (not screenshots)

- **Diff-friendly**: text changes show up cleanly in PRs.
- **Theme-aware**: dark-mode wikis don't break.
- **Zero IP risk**: see [CONTRIBUTING.md - Image-licensing policy](../CONTRIBUTING.md#image-licensing-policy). We do not mirror third-party diagrams; we recreate them here.
