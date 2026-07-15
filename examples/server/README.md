# Reference MCP Server

This is a runnable TypeScript **Streamable HTTP MCP** server used to prove the handbook patterns in practice.

It exposes:

- `POST /mcp` for JSON-RPC requests/notifications/responses
- `GET /mcp` returning `405` (no server-initiated stream in v1)
- `DELETE /mcp` returning `405` (stateless server)
- `GET /healthz`, `GET /readyz`, `GET /metrics`

## Local run

```bash
cd examples/server
npm ci
npm run dev
```

## Build and run

```bash
cd examples/server
npm ci
npm run build
npm start
```

## Docker

```bash
docker build -t mcp-reference-server:local examples/server
docker run --rm -p 8080:8080 mcp-reference-server:local
```

## Environment variables

- `PORT` (default `8080`)
- `MCP_ENDPOINT_PATH` (default `/mcp`)
- `MCP_ALLOWED_ORIGINS` comma-separated allowlist (default `*`)
- `MCP_OAUTH_ISSUER` optional OAuth issuer URL; when set, bearer auth is required
- `MCP_OAUTH_AUDIENCE` expected token audience (required when issuer is set)
- `MCP_OAUTH_REQUIRED_SCOPES` comma-separated scopes
- `MCP_OAUTH_JWKS_URL` optional JWKS URL override
- `OTEL_EXPORTER_OTLP_ENDPOINT` optional OTLP endpoint

## Run tests

```bash
cd examples/server
npm ci
npm test
```
