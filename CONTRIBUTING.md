# Contributing to the MCP Hosting Handbook

This handbook is a living document. The rules below exist so that every claim is auditable, every source is properly attributed, and we never accidentally ship copyrighted material we don't have rights to.

## TL;DR

1. Every normative claim in `docs/` ends with one or more `[src: <id>]` tags.
2. Every `<id>` resolves to a row in [`sources/_index.csv`](sources/_index.csv).
3. New sources are added via `pwsh ./scripts/fetch-source.ps1 -Url <url>`.
4. Run `pwsh ./scripts/validate-claims.ps1` before merging changes to `docs/`.
5. Do not mirror third-party images. Recreate them in Mermaid and link out.

## Citation rules

### Inline citation tags

Every paragraph that asserts a non-obvious technical fact must end with one or more bracketed citation tags:

```
The Streamable HTTP transport consolidates client-to-server traffic onto a single endpoint. [src: spec-transports]
```

The `<id>` is the slug column from [`sources/_index.csv`](sources/_index.csv). Multiple sources are comma-separated:

```
Stateless mode is the recommended default for horizontally scaled MCP deployments. [src: mcpcat-prod, fordel-prod]
```

### Triangulation rule

Every normative claim must be backed by either:

- (a) the official MCP specification, or
- (b) **two independent** Tier 2-4 sources (see Source tiers below).

A blog post and its mirror on Medium count as one source.

### Recency gate

The MCP spec is moving fast. The handbook prefers sources from 2025-2026. The validation script flags any cited source older than 12 months. When the spec has materially changed (e.g., HTTP+SSE deprecation, SEP-2243 header standardization), call that out inline.

## Source tiers

The corpus in [`sources/`](sources/) is tiered by authority. Use the highest tier you can.

| Tier | Description | Examples |
|---|---|---|
| 1 | Official specification | `modelcontextprotocol.io/specification`, MCP RFCs/SEPs, official GitHub PRs |
| 2 | First-party SDK / framework docs | OpenAI Agents SDK, Anthropic MCP docs, Dapr MCP docs, official OAuth blueprint |
| 3 | Vendor / cloud how-tos | Cloudflare Workers MCP template, Helm chart READMEs, GKE/EKS guides |
| 4 | Community production guides | mcpcat.io, systemprompt.io, fordelstudios.com, tmdevlab.com |

## Adding a new source

```powershell
pwsh ./scripts/fetch-source.ps1 -Url "https://modelcontextprotocol.io/specification/2025-06-18/basic/transports" -Slug spec-transports -Tier 1 -License "CC-BY-4.0"
```

The script will:

1. Download the page.
2. Convert it to clean Markdown under [`sources/pages/<slug>.md`](sources/pages/) with a YAML front-matter block (`url`, `fetched_at`, `sha256`, `license`, `tier`).
3. Compute SHA256 of the cleaned Markdown.
4. Append a row to [`sources/_index.csv`](sources/_index.csv).

If the slug already exists, the script updates the row and writes the new SHA256 alongside the previous one so we can detect drift.

## Image-licensing policy

**Default: do not mirror third-party images into this repo.** Most blog and Medium illustrations are copyright-protected, and mirroring creates IP risk even for internal use.

Acceptable images for [`sources/images/`](sources/images/) and [`docs/`](docs/):

- (a) Diagrams we authored (Mermaid sources in [`diagrams/`](diagrams/) or PNG/SVG renders).
- (b) Images released under a permissive license (CC-BY, CC-0, MIT, Apache-2.0, public domain). Record the license in [`sources/_index.csv`](sources/_index.csv).
- (c) Screenshots of the official MCP spec or source code (fair use as evidence), kept in `sources/images/` with the source URL recorded.

Anything else: link out to the original instead, and recreate the diagram in Mermaid. This is one of the most valuable places we can add original value over the existing blog ecosystem.

## Diagrams

- Author diagrams in Mermaid as `.mmd` files in [`diagrams/`](diagrams/). Mermaid is text, diff-friendly, and theme-aware.
- Run `pwsh ./scripts/render-diagrams.ps1` to render `.mmd` -> `.svg` and `.png` (requires `@mermaid-js/mermaid-cli` on PATH).
- In Markdown, embed diagrams as fenced ```mermaid blocks. Inline rendering works in GitHub, GitLab, and most internal wikis.

## Handbook style

- Use sentence case in headings (`## Sessions and state`, not `## Sessions And State`).
- Code spans for: file paths, command names, env vars, header names, HTTP methods.
- Prefer concrete numbers over hand-waving ("CPU request 200m, limit 1000m" beats "small CPU request").
- Call out trade-offs explicitly. Every "do X" should answer "and the cost of X is Y".
- Don't repeat the same claim across chapters. Link instead.

## Validating before merge

```powershell
pwsh ./scripts/validate-claims.ps1
```

The script:

- Walks every `.md` file under `docs/`.
- Extracts every `[src: <id>]` tag.
- Verifies each `<id>` resolves to a row in [`sources/_index.csv`](sources/_index.csv).
- Warns on rows older than 365 days (recency gate).
- Warns on rows whose `local_path` no longer exists.

Fix all errors before merging. Warnings are advisory but should be addressed when convenient.
