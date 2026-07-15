---
slug: spec-registry-remote
url: https://modelcontextprotocol.io/registry/remote-servers
title: Publishing Remote Servers - Model Context Protocol
author: 
fetched_at: 2026-04-30T20:50:07Z
sha256: 3dfb45116e8350dabdca6b6b0b0ec448c2f1a1b0cad2b526abbbd8c47171993a
license: MIT-spec
tier: 1
---
- Publishing Remote Servers - Model Context ProtocolSkip to main content[Model Context Protocol home page](/)[Documentation](/docs/getting-started/intro)[Extensions](/extensions/overview)[Specification](/specification/2025-11-25)[Registry](/registry/about)[SEPs](/seps)[Community](/community/contributing)[About](/registry/about)
- [Quickstart: Publish a Server](/registry/quickstart)
- [FAQ](/registry/faq)
##### Publishing

- [Package Types](/registry/package-types)
- [Remote Servers](/registry/remote-servers)
- [Authentication](/registry/authentication)
- [Versioning](/registry/versioning)
- [GitHub Actions](/registry/github-actions)
- [Moderation Policy](/registry/moderation-policy)
##### Consuming

- [Registry Aggregators](/registry/registry-aggregators)
- [Terms of Service](/registry/terms-of-service)
- Transport Type
- URL Template Variables
- HTTP Headers
- Supporting Remote and Non-remote Installation**
## Documentation Index
Fetch the complete documentation index at: [https://modelcontextprotocol.io/llms.txt](https://modelcontextprotocol.io/llms.txt)

Use this file to discover all available pages before exploring further.

The MCP Registry is currently in preview. Breaking changes or data resets may occur before general availability. If you encounter any issues, please report them on [GitHub](https://github.com/modelcontextprotocol/registry/issues).
The MCP Registry supports remote MCP servers via the `remotes` property in `server.json`:
server.json
```
{
 "$schema": "https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json",
 "name": "com.example/acme-analytics",
 "title": "ACME Analytics",
 "description": "Real-time business intelligence and reporting platform",
 "version": "2.0.0",
 "remotes": [
 {
 "type": "streamable-http",
 "url": "https://analytics.example.com/mcp"
 }
 ]
}
```

A remote server MUST** be publicly accessible at its specified URL.

## ​Transport Type

Remote servers can use the Streamable HTTP transport (recommended) or the SSE transport. Remote servers can also support both transports simultaneously at different URLs.
Specify the transport by setting the `type` property of the `remotes` entry to either `"streamable-http"` or `"sse"`:
server.json
```
{
 "$schema": "https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json",
 "name": "com.example/acme-analytics",
 "title": "ACME Analytics",
 "description": "Real-time business intelligence and reporting platform",
 "version": "2.0.0",
 "remotes": [
 {
 "type": "streamable-http",
 "url": "https://analytics.example.com/mcp"
 },
 {
 "type": "sse",
 "url": "https://analytics.example.com/sse"
 }
 ]
}
```

## ​URL Template Variables

Remote servers can define URL template variables using `{curly_braces}` notation. This enables multi-tenant deployments where a single server definition can support multiple endpoints with configurable values:
server.json
```
{
 "$schema": "https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json",
 "name": "com.example/acme-analytics",
 "title": "ACME Analytics",
 "description": "Real-time business intelligence and reporting platform",
 "version": "2.0.0",
 "remotes": [
 {
 "type": "streamable-http",
 "url": "https://{tenant_id}.analytics.example.com/mcp",
 "variables": {
 "tenant_id": {
 "description": "Your tenant identifier (e.g., 'us-cell1', 'emea-cell1')",
 "isRequired": true
 }
 }
 }
 ]
}
```

When configuring this server, users provide their `tenant_id` value, and the URL template gets resolved to the appropriate endpoint (e.g., `https://us-cell1.analytics.example.com/mcp`).
Variables support additional properties like `default`, `choices`, and `isSecret`:
server.json
```
{
 "$schema": "https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json",
 "name": "com.example/multi-region-mcp",
 "title": "Multi-Region MCP",
 "description": "MCP server with regional endpoints",
 "version": "1.0.0",
 "remotes": [
 {
 "type": "streamable-http",
 "url": "https://api.example.com/{region}/mcp",
 "variables": {
 "region": {
 "description": "Deployment region",
 "isRequired": true,
 "choices": [
 "us-east-1",
 "eu-west-1",
 "ap-southeast-1"
 ],
 "default": "us-east-1"
 }
 }
 }
 ]
}
```

## ​HTTP Headers

MCP clients can be instructed to send specific HTTP headers by adding the `headers` property to the `remotes` entry:
server.json
```
{
 "$schema": "https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json",
 "name": "com.example/acme-analytics",
 "title": "ACME Analytics",
 "description": "Real-time business intelligence and reporting platform",
 "version": "2.0.0",
 "remotes": [
 {
 "type": "streamable-http",
 "url": "https://analytics.example.com/mcp",
 "headers": [
 {
 "name": "X-API-Key",
 "description": "API key for authentication",
 "isRequired": true,
 "isSecret": true
 }
 ]
 }
 ]
}
```

## ​Supporting Remote and Non-remote Installation

The `remotes` property can coexist with the `packages` property in `server.json` in order to allow MCP host applications to choose the preferred method of installation.
server.json
```
{
 "$schema": "https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json",
 "name": "io.github.username/email-integration-mcp",
 "title": "Email Integration",
 "description": "Send emails and manage email accounts",
 "version": "1.0.0",
 "remotes": [
 {
 "type": "streamable-http",
 "url": "https://email.example.com/mcp"
 }
 ],
 "packages": [
 {
 "registryType": "npm",
 "identifier": "@example/email-integration-mcp",
 "version": "1.0.0",
 "transport": {
 "type": "stdio"
 }
 }
 ]
}
```
Was this page helpful?

[Package Types](/registry/package-types)[Authentication](/registry/authentication)⌘I
