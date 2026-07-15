---
slug: prod-systemprompt-deploy
url: https://systemprompt.io/guides/mcp-servers-production-deployment
title: Deploy MCP Servers to Production with HTTP and Docker | systemprompt.io
author: systemprompt.io
fetched_at: 2026-04-30T20:53:02Z
sha256: 83b7029c2941745a02f602af3ba0ee54e51d479850fab77c43a774f57f698294
license: blog-fair-use
tier: 4
---
- Deploy MCP Servers to Production with HTTP and Docker | systemprompt.io
 
 
 
 

 
 
 
 
 
 
 
 
 
 

 
 
 
 
 
 

 

 
 
 

 

 

 

 

 
 
 

 Skip to main content

 
 
 

 
 

 
 
 
 
 
 
 
 
 

 

 
 
 
 Table of contents
 
 
 

Prelude

- The Problem

- The Journey

Understanding MCP Transport Types

MCP Transport Mechanisms Compared

- Setting Up Streamable HTTP Transport

Streamable HTTP Server Reference Implementation

- Adding Authentication

- Rate Limiting and Abuse Prevention

- Error Handling and JSON-RPC Codes

- Monitoring and Observability

MCP Observability Stack Matrix

- Prometheus Metrics for MCP Tool Calls

- Scaling Patterns

MCP Deployment Architecture Topologies

- nginx Session Affinity for MCP Servers

- Container Deployment

Production Dockerfile for MCP Servers

- Kubernetes Deployment for MCP Servers

- Configuration Management

- The Production Architecture

- Graceful Shutdown

- Troubleshooting Production MCP Server Failures

- Common Pitfalls When Moving from Stdio to HTTP

- The Lesson

- Conclusion

- Further Reading

 
 

 
 
## Prelude

Building a first MCP server is a satisfying Sunday afternoon project. It runs on a laptop, communicates over stdio, and gives Claude access to a handful of internal tools. It feels like plugging a new limb into the AI. You can ask Claude to query a database, check deployment status, or read from an internal wiki, all through natural language.

Then Monday comes and a colleague asks to use it too.

That question breaks everything. The server is a process that Claude Code spawns as a child, reading from stdin and writing to stdout. It is bound to one machine, one terminal, one session. There is no URL to share, no endpoint to point at, no way for a second person to connect.

Moving an MCP server from a developer's laptop into a production environment changes everything. The transport changes. The error handling changes. The security requirements change entirely. What worked as a local prototype needs authentication, monitoring, rate limiting, container packaging, and a deployment pipeline before it can serve a team.

This guide covers everything needed for that transition. If you have already [built your first MCP server](/guides/build-mcp-server-rust) and want to move beyond localhost, this is the path forward.

## The Problem

MCP servers in development are simple. The [Model Context Protocol specification](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports) defines stdio as the default transport. Claude Code spawns your server as a child process, sends JSON-RPC messages through stdin, and reads responses from stdout. No networking, no ports, no configuration beyond a command path.

This simplicity is also a ceiling. Stdio transport means the server lives and dies with the client process. It runs on the same machine. It serves exactly one client. It cannot be load-balanced, health-checked, or monitored by external systems. If it crashes, the client has to restart it. If it leaks memory, there is no external watchdog to catch it.

Production workloads need fundamentally different properties. Multiple developers connecting to the same server. Centralised logging and monitoring. Authentication so that only authorised users can call tools. Rate limiting to prevent a runaway AI session from hammering your backend. Health checks so your orchestrator can restart failed instances. Horizontal scaling when one instance is not enough.

The MCP specification anticipated this. It defines multiple transport types, and the one designed for production is Streamable HTTP. But the specification gives you the protocol. It does not give you the deployment patterns, the operational practices, or the hard lessons from running these systems under real load.

That is what this guide provides.

## The Journey

### Understanding MCP Transport Types

The Model Context Protocol defines three transport mechanisms, each suited to different deployment scenarios.

#### MCP Transport Mechanisms Compared

Transport
Direction
Concurrency
Session state
Recommended use

stdio
Bidirectional over stdin/stdout of a child process
One client per server process
Implicit (lifetime of the child process)
Local development, single-user tooling, Claude Code default

Streamable HTTP
POST for requests; optional SSE upgrade for streaming and server notifications
Multiple clients, multiple sessions
Tracked via `Mcp-Session-Id` header
Production, remote access, multi-user deployments

HTTP+SSE (legacy)
Separate POST for client-to-server and dedicated SSE endpoint for server-to-client
Multiple clients
Tracked server-side
Legacy only; replaced by Streamable HTTP for new work

*Data source: [MCP Transports specification 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports), as of 2026-04. Permalink: [systemprompt.io/guides/mcp-servers-production-deployment#mcp-transport-mechanisms-compared](https://systemprompt.io/guides/mcp-servers-production-deployment#mcp-transport-mechanisms-compared).*

**Stdio** is the simplest. The client spawns the server as a child process. Messages flow through stdin and stdout. This is what you use during development and what Claude Code defaults to when you configure an MCP server with a command. It is fast, requires no network configuration, and works everywhere. But it is inherently local. One client, one server, one machine.

**Streamable HTTP** is the production transport. The server exposes an HTTP endpoint (typically `/mcp`), and the client sends JSON-RPC requests as POST bodies. The server can respond with a simple JSON response for request-response patterns, or it can upgrade the connection to Server-Sent Events (SSE) for streaming responses and server-initiated notifications. Session management happens through the `Mcp-Session-Id` header. Since the June 2025 specification, HTTP-based connections must also include an `MCP-Protocol-Version` header specifying the negotiated protocol version, enabling proper version negotiation between clients and servers.

**SSE** is the legacy transport from the earlier MCP specification. It uses a dedicated SSE endpoint for server-to-client messages and a separate POST endpoint for client-to-server messages. It still works, but the specification now recommends Streamable HTTP for all new implementations. If you are building something new, skip SSE entirely.

The transition from stdio to Streamable HTTP is not just a transport swap. It changes how you think about the server's lifecycle. A stdio server is ephemeral. It exists for the duration of a single client session. A Streamable HTTP server is a long-running service that manages multiple concurrent sessions, each with its own state.

### Setting Up Streamable HTTP Transport

The following walkthrough covers building a production-ready MCP server with Streamable HTTP transport. The examples use TypeScript with the official MCP SDK because it has the most mature HTTP transport support.

First, the basic server structure.

#### Streamable HTTP Server Reference Implementation

```
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";

const app = express();
app.use(express.json());

const server = new McpServer({
 name: "production-tools",
 version: "1.0.0",
});

// Register your tools
server.tool(
 "get_deployment_status",
 "Check the deployment status of a service",
 { service: { type: "string", description: "Service name" } },
 async ({ service }) => {
 const status = await checkDeployment(service);
 return {
 content: [{ type: "text", text: JSON.stringify(status, null, 2) }],
 };
 }
);

// Session management
const sessions = new Map();

app.post("/mcp", async (req, res) => {
 const sessionId = req.headers["mcp-session-id"] as string | undefined;

 if (sessionId && sessions.has(sessionId)) {
 const transport = sessions.get(sessionId)!;
 await transport.handleRequest(req, res);
 return;
 }

 // New session
 const transport = new StreamableHTTPServerTransport({
 sessionIdGenerator: () => crypto.randomUUID(),
 onsessioninitialized: (id) => {
 sessions.set(id, transport);
 },
 });

 transport.onclose = () => {
 if (transport.sessionId) {
 sessions.delete(transport.sessionId);
 }
 };

 await server.connect(transport);
 await transport.handleRequest(req, res);
});

app.listen(3001, () => {
 console.error("MCP server listening on port 3001");
});
```

*Data sources: [MCP Transports specification 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports) and [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk), as of 2026-04. Permalink: [systemprompt.io/guides/mcp-servers-production-deployment#streamable-http-server-reference-implementation](https://systemprompt.io/guides/mcp-servers-production-deployment#streamable-http-server-reference-implementation).*

Notice that `console.error` is used for the startup message, not `console.log`. This matters. MCP servers must never write non-protocol data to stdout. In stdio mode, stdout is the protocol channel. Even with HTTP transport, maintaining this discipline prevents subtle bugs if you ever need to support both transports.

The session management map tracks active sessions by their `Mcp-Session-Id`. When a client sends its first request (the `initialize` message), the server creates a new transport and assigns a session ID. Subsequent requests from the same client include that session ID in the header, routing them to the correct transport instance.

### Adding Authentication

A production MCP server without authentication is an open door to your internal systems. Every tool you expose becomes callable by anyone who knows the endpoint. If your MCP server can query a database, an unauthenticated server lets anyone query that database.

The simplest authentication approach is Bearer token validation. Add middleware that checks every request before it reaches the MCP handler.

```
import { Request, Response, NextFunction } from "express";

const API_KEYS = new Set(
 (process.env.MCP_API_KEYS || "").split(",").filter(Boolean)
);

function authenticate(req: Request, res: Response, next: NextFunction) {
 const auth = req.headers.authorization;

 if (!auth || !auth.startsWith("Bearer ")) {
 res.status(401).json({
 jsonrpc: "2.0",
 error: { code: -32001, message: "Authentication required" },
 id: null,
 });
 return;
 }

 const token = auth.slice(7);
 if (!API_KEYS.has(token)) {
 res.status(403).json({
 jsonrpc: "2.0",
 error: { code: -32002, message: "Invalid credentials" },
 id: null,
 });
 return;
 }

 next();
}

app.post("/mcp", authenticate, async (req, res) => {
 // ... MCP handling
});
```

This is the minimum. For a deeper treatment of authentication patterns including OAuth 2.1, token rotation, and per-user tool scoping, see the companion guide on [MCP server authentication and security](/guides/mcp-server-authentication-security).

Bearer tokens work well for service-to-service communication where both sides are systems you control. For user-facing deployments where individual developers authenticate with their own credentials, [OAuth 2.1](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1-12) is the mechanism the MCP specification recommends.

### Rate Limiting and Abuse Prevention

AI clients behave differently from human users. A single Claude Code session can generate dozens of tool calls in rapid succession, particularly during agentic workflows where Claude is iterating on a problem. Without rate limiting, one developer's aggressive session can overwhelm your backend services.

A sliding window rate limiter keyed on the client's API key or session ID works well here.

```
const rateLimits = new Map();

const RATE_LIMIT = 100; // requests per window
const WINDOW_MS = 60000; // 1 minute window

function rateLimit(req: Request, res: Response, next: NextFunction) {
 const token = req.headers.authorization?.slice(7) || "anonymous";
 const now = Date.now();

 let bucket = rateLimits.get(token);
 if (!bucket || now > bucket.resetAt) {
 bucket = { count: 0, resetAt: now + WINDOW_MS };
 rateLimits.set(token, bucket);
 }

 bucket.count++;

 res.setHeader("X-RateLimit-Limit", RATE_LIMIT);
 res.setHeader("X-RateLimit-Remaining", Math.max(0, RATE_LIMIT - bucket.count));
 res.setHeader("X-RateLimit-Reset", Math.ceil(bucket.resetAt / 1000));

 if (bucket.count > RATE_LIMIT) {
 res.status(429).json({
 jsonrpc: "2.0",
 error: {
 code: -32003,
 message: "Rate limit exceeded. Try again later.",
 },
 id: null,
 });
 return;
 }

 next();
}
```

One hundred requests per minute is a reasonable starting point for most internal tools. Adjust based on your backend capacity and the expected call patterns of your tools. Some tools are cheap (reading a config value) and some are expensive (running a database migration). You might want per-tool rate limits in addition to the global limit.

### Error Handling and JSON-RPC Codes

MCP uses [JSON-RPC 2.0](https://www.jsonrpc.org/specification), which defines a specific error response format. Getting this right matters because the client (Claude Code) uses these error codes to decide what to do next. A well-formed error response lets Claude retry intelligently or explain the failure to the user. A malformed error or a connection drop leaves Claude guessing.

The standard JSON-RPC error codes are your foundation.

```
const ErrorCodes = {
 PARSE_ERROR: -32700, // Invalid JSON
 INVALID_REQUEST: -32600, // Not a valid JSON-RPC request
 METHOD_NOT_FOUND: -32601, // Tool or method does not exist
 INVALID_PARAMS: -32602, // Invalid tool arguments
 INTERNAL_ERROR: -32603, // Server-side failure
};
```

Beyond these, define application-specific codes for your tools. The -32000 to -32099 range that JSON-RPC reserves for implementation-defined errors is ideal for this purpose.

```
const AppErrorCodes = {
 AUTH_REQUIRED: -32001,
 AUTH_INVALID: -32002,
 RATE_LIMITED: -32003,
 SERVICE_UNAVAILABLE: -32004,
 UPSTREAM_TIMEOUT: -32005,
};
```

Wrap your tool implementations in error handlers that catch exceptions and return structured errors. Never let an unhandled exception crash the server or return a raw stack trace.

```
server.tool(
 "query_database",
 "Run a read-only SQL query",
 { query: { type: "string" } },
 async ({ query }) => {
 try {
 const result = await db.query(query);
 return {
 content: [{ type: "text", text: JSON.stringify(result.rows) }],
 };
 } catch (error) {
 return {
 content: [
 {
 type: "text",
 text: `Database query failed: ${error.message}`,
 },
 ],
 isError: true,
 };
 }
 }
);
```

The `isError: true` flag in the tool response tells Claude that the tool call failed. Claude will typically report the error to the user rather than trying to interpret the error message as successful output. Without this flag, Claude might treat an error message as a valid query result.

### Monitoring and Observability

A production MCP server without monitoring is a server you will be debugging blind at 2am. Consider a scenario where a tool that queries an external API starts timing out intermittently. Without metrics, there is no way to know it is happening until users report that Claude is "being slow."

Start with three layers of observability.

#### MCP Observability Stack Matrix

Signal
MCP-specific fields
OpenTelemetry semantic convention

Logs
`requestId`, `sessionId` (from `Mcp-Session-Id`), tool name, JSON-RPC method, status, duration, JSON-RPC error code (`-32001` auth, `-32602` invalid params, etc.)
[OTel logs data model](https://opentelemetry.io/docs/specs/otel/logs/data-model/) and [general log attributes](https://opentelemetry.io/docs/specs/semconv/general/logs/)

Metrics
`mcp_tool_calls_total` counter (labels: tool_name, status), `mcp_tool_call_duration_seconds` histogram, `mcp_active_sessions` gauge
[OTel RPC metrics](https://opentelemetry.io/docs/specs/semconv/rpc/rpc-metrics/) and [HTTP metrics](https://opentelemetry.io/docs/specs/semconv/http/http-metrics/)

Traces
One span per tool call; attributes for `rpc.system=jsonrpc`, `rpc.method`, `mcp.session.id`, error details mapped to [JSON-RPC 2.0 error objects](https://www.jsonrpc.org/specification#error_object)
[OTel RPC spans](https://opentelemetry.io/docs/specs/semconv/rpc/rpc-spans/)

*Data sources: [OpenTelemetry Semantic Conventions](https://opentelemetry.io/docs/specs/semconv/) and [JSON-RPC 2.0 specification](https://www.jsonrpc.org/specification), as of 2026-04. Permalink: [systemprompt.io/guides/mcp-servers-production-deployment#mcp-observability-stack-matrix](https://systemprompt.io/guides/mcp-servers-production-deployment#mcp-observability-stack-matrix).*

**Health checks** tell your orchestrator whether the server is alive and ready to accept requests.

```
app.get("/health", (req, res) => {
 const health = {
 status: "ok",
 uptime: process.uptime(),
 activeSessions: sessions.size,
 timestamp: new Date().toISOString(),
 };
 res.json(health);
});

app.get("/ready", async (req, res) => {
 try {
 await db.query("SELECT 1");
 res.json({ status: "ready" });
 } catch {
 res.status(503).json({ status: "not ready", reason: "database unavailable" });
 }
});
```

Separate liveness (`/health`) from readiness (`/ready`). Your orchestrator uses liveness to decide whether to restart the container and readiness to decide whether to route traffic to it. A server can be alive but not ready if its database connection is down.

**Request logging** captures every tool call with timing, caller identity, and outcome.

```
function requestLogger(req: Request, res: Response, next: NextFunction) {
 const start = Date.now();
 const requestId = crypto.randomUUID();

 res.on("finish", () => {
 const duration = Date.now() - start;
 const logEntry = {
 requestId,
 method: req.method,
 path: req.path,
 sessionId: req.headers["mcp-session-id"],
 status: res.statusCode,
 duration,
 timestamp: new Date().toISOString(),
 };
 console.error(JSON.stringify(logEntry));
 });

 next();
}

app.use(requestLogger);
```

**Metrics** feed into your existing monitoring stack. If you use Prometheus, expose a `/metrics` endpoint with counters for tool calls, histograms for response times, and gauges for active sessions. The [`prom-client` npm package](https://www.npmjs.com/package/prom-client) is the standard Node.js Prometheus client and supports all metric types used here.

#### Prometheus Metrics for MCP Tool Calls

```
import { Registry, Counter, Histogram, Gauge } from "prom-client";

const registry = new Registry();

const toolCallCounter = new Counter({
 name: "mcp_tool_calls_total",
 help: "Total number of MCP tool calls",
 labelNames: ["tool_name", "status"],
 registers: [registry],
});

const toolCallDuration = new Histogram({
 name: "mcp_tool_call_duration_seconds",
 help: "Duration of MCP tool calls",
 labelNames: ["tool_name"],
 buckets: [0.01, 0.05, 0.1, 0.5, 1, 5, 10],
 registers: [registry],
});

const activeSessions = new Gauge({
 name: "mcp_active_sessions",
 help: "Number of active MCP sessions",
 registers: [registry],
});

app.get("/metrics", async (req, res) => {
 res.set("Content-Type", registry.contentType);
 res.end(await registry.metrics());
});
```

*Data sources: [Prometheus exposition format](https://prometheus.io/docs/instrumenting/exposition_formats/) and [OpenTelemetry RPC metrics](https://opentelemetry.io/docs/specs/semconv/rpc/rpc-metrics/), as of 2026-04. Permalink: [systemprompt.io/guides/mcp-servers-production-deployment#prometheus-metrics-for-mcp-tool-calls](https://systemprompt.io/guides/mcp-servers-production-deployment#prometheus-metrics-for-mcp-tool-calls).*

With these three layers, you can answer the questions that matter. Is the server healthy? How many requests per second is it handling? Which tools are slowest? Which clients are generating the most load?

### Scaling Patterns

#### MCP Deployment Architecture Topologies

Topology
Client path to server
TLS termination
Session routing
Best fit

Standalone behind gateway
Client -> ingress/reverse proxy -> MCP server
At the gateway
Consistent-hash on `Mcp-Session-Id` at the gateway
Multi-tenant production; multiple replicas behind a single public endpoint

Sidecar
Client -> application pod containing MCP server as a sidecar
At the application ingress
No external affinity needed; sessions pinned to the pod lifecycle
One MCP server per application instance; per-pod state isolation

Direct-exposed standalone
Client -> MCP server
Inside the server process
Single-instance only; no affinity logic required
Internal tools on a trusted network; low-traffic single-replica deployments

*Data sources: [MCP Transports specification 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports) and [Kubernetes Ingress controllers](https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/), as of 2026-04. Permalink: [systemprompt.io/guides/mcp-servers-production-deployment#mcp-deployment-architecture-topologies](https://systemprompt.io/guides/mcp-servers-production-deployment#mcp-deployment-architecture-topologies).*

A single MCP server instance can handle a surprising amount of load. JSON-RPC messages are small, tool calls are typically I/O-bound (waiting on databases, APIs, or file systems), and Node.js handles concurrent I/O well. A single instance can comfortably serve 50 or more concurrent sessions.

But eventually you need more than one instance. The key challenge is session state.

If your server is stateless (no session-level caching, no in-memory state beyond the transport), horizontal scaling is straightforward. Run multiple instances behind a load balancer. Any instance can handle any request.

If your server maintains session state (which the session management map in the earlier example does), you need session affinity. The load balancer must route all requests from the same session to the same instance.

#### nginx Session Affinity for MCP Servers

```
# nginx configuration for MCP server with session affinity
upstream mcp_servers {
 hash $http_mcp_session_id consistent;
 server mcp-server-1:3001;
 server mcp-server-2:3001;
 server mcp-server-3:3001;
}

server {
 listen 443 ssl;
 server_name mcp.internal.company.com;

 location /mcp {
 proxy_pass http://mcp_servers;
 proxy_set_header Host $host;
 proxy_set_header X-Real-IP $remote_addr;
 proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
 proxy_set_header X-Forwarded-Proto $scheme;

 # SSE support
 proxy_buffering off;
 proxy_cache off;
 proxy_read_timeout 300s;
 }

 location /health {
 proxy_pass http://mcp_servers;
 }

 location /metrics {
 proxy_pass http://mcp_servers;
 # Restrict metrics to internal network
 allow 10.0.0.0/8;
 deny all;
 }
}
```

*Data source: [nginx `ngx_http_upstream_module` hash directive](https://nginx.org/en/docs/http/ngx_http_upstream_module.html#hash), as of 2026-04. Permalink: [systemprompt.io/guides/mcp-servers-production-deployment#nginx-session-affinity-for-mcp-servers](https://systemprompt.io/guides/mcp-servers-production-deployment#nginx-session-affinity-for-mcp-servers).*

The `hash $http_mcp_session_id consistent` directive routes requests with the same `Mcp-Session-Id` header to the same backend. The `consistent` modifier ensures that when a server is added or removed, only a fraction of sessions are remapped rather than all of them.

For production deployments where sessions must survive server restarts, move session state out of the process. Redis is the natural choice. Store the session data in Redis keyed by session ID, and any server instance can pick up any session.

### Container Deployment

Docker is the standard packaging for production MCP servers. Here is a production Dockerfile.

#### Production Dockerfile for MCP Servers

```
FROM node:22-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --production=false
COPY . .
RUN npm run build

FROM node:22-slim
WORKDIR /app
RUN addgroup --system mcp && adduser --system --ingroup mcp mcp
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
USER mcp
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
 CMD node -e "fetch('http://localhost:3001/health').then(r => r.ok ? process.exit(0) : process.exit(1))"
CMD ["node", "dist/server.js"]
```

*Data sources: [Dockerfile HEALTHCHECK reference](https://docs.docker.com/reference/dockerfile/#healthcheck) and [docker-node best practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md), as of 2026-04. Permalink: [systemprompt.io/guides/mcp-servers-production-deployment#production-dockerfile-for-mcp-servers](https://systemprompt.io/guides/mcp-servers-production-deployment#production-dockerfile-for-mcp-servers).*

Key details. The multi-stage build keeps the final image small. The non-root user (`mcp`) follows the principle of least privilege. The `HEALTHCHECK` directive lets Docker and orchestrators detect failures automatically.

For Kubernetes, a minimal deployment looks like this.

#### Kubernetes Deployment for MCP Servers

```
apiVersion: apps/v1
kind: Deployment
metadata:
 name: mcp-server
spec:
 replicas: 3
 selector:
 matchLabels:
 app: mcp-server
 template:
 metadata:
 labels:
 app: mcp-server
 spec:
 containers:
 - name: mcp-server
 image: registry.internal/mcp-server:1.0.0
 ports:
 - containerPort: 3001
 env:
 - name: MCP_API_KEYS
 valueFrom:
 secretKeyRef:
 name: mcp-secrets
 key: api-keys
 livenessProbe:
 httpGet:
 path: /health
 port: 3001
 initialDelaySeconds: 10
 periodSeconds: 30
 readinessProbe:
 httpGet:
 path: /ready
 port: 3001
 initialDelaySeconds: 5
 periodSeconds: 10
 resources:
 requests:
 memory: "128Mi"
 cpu: "100m"
 limits:
 memory: "512Mi"
 cpu: "500m"
```

*Data sources: [Kubernetes Deployment reference](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/), [liveness and readiness probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/), and [resource management for pods](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/), as of 2026-04. Permalink: [systemprompt.io/guides/mcp-servers-production-deployment#kubernetes-deployment-for-mcp-servers](https://systemprompt.io/guides/mcp-servers-production-deployment#kubernetes-deployment-for-mcp-servers).*

Secrets like API keys come from Kubernetes secrets, not environment variables baked into the image. The resource limits prevent a single pod from consuming unbounded memory or CPU. The liveness and readiness probes give Kubernetes the information it needs to manage the server's lifecycle. The [Kubernetes liveness and readiness probe documentation](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/) covers the full probe configuration options, including failure thresholds and initial delay tuning for slow-starting containers.

### Configuration Management

Production servers need different configurations for different environments. Use environment variables for values that change between deployments and configuration files for values that change between releases.

```
const config = {
 port: parseInt(process.env.PORT || "3001"),
 logLevel: process.env.LOG_LEVEL || "info",
 rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || "100"),
 rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000"),
 dbConnectionString: process.env.DATABASE_URL,
 corsOrigins: (process.env.CORS_ORIGINS || "").split(",").filter(Boolean),
 tlsEnabled: process.env.TLS_ENABLED === "true",
};

// Validate required config at startup
const required = ["DATABASE_URL", "MCP_API_KEYS"];
for (const key of required) {
 if (!process.env[key]) {
 console.error(`Missing required environment variable: ${key}`);
 process.exit(1);
 }
}
```

Fail fast on missing configuration. A server that starts without its database connection string will fail on the first tool call, producing a confusing error. Better to fail immediately at startup with a clear message about what is missing.

Never log secrets. If you log your configuration at startup for debugging (which is recommended), redact sensitive values.

```
console.error("Configuration loaded:", {
 ...config,
 dbConnectionString: config.dbConnectionString ? "[REDACTED]" : "not set",
});
```

### The Production Architecture

After extensive iteration, the architecture that works best for production MCP deployments looks like this.

```
Client (Claude Code)
 |
 | HTTPS + Bearer Token
 |
Reverse Proxy (Caddy or nginx)
 |
 | HTTP (internal network)
 |
MCP Server (Node.js / Rust / Python)
 |
 |--- Backend API (REST/gRPC)
 |--- Database (PostgreSQL/Redis)
 |--- External Services (APIs, queues)
```

The reverse proxy handles TLS termination, connection limits, and request buffering. It also provides a natural point for adding IP allowlisting or mutual TLS for internal services.

The MCP server itself is as thin as possible. It validates inputs, calls backend services, and formats results. Business logic lives in the backend services, not in the MCP server. This separation means you can update your backend APIs without redeploying the MCP server, and you can expose the same backend through both MCP and traditional REST APIs.

For SSE support (which Streamable HTTP uses for streaming responses), the reverse proxy must be configured to disable response buffering. Without this, SSE events are buffered and delivered in batches, which defeats the purpose of streaming.

With Caddy, the configuration is simpler.

```
mcp.internal.company.com {
 reverse_proxy mcp-server:3001 {
 flush_interval -1
 }
}
```

The `flush_interval -1` directive disables response buffering, allowing SSE events to flow through immediately.

### Graceful Shutdown

Production servers must handle shutdown signals cleanly. When Kubernetes sends a SIGTERM, or when you deploy a new version, active sessions should complete rather than being killed mid-request.

```
let isShuttingDown = false;

process.on("SIGTERM", async () => {
 console.error("Received SIGTERM, starting graceful shutdown");
 isShuttingDown = true;

 // Stop accepting new sessions
 app.use((req, res, next) => {
 if (req.path === "/mcp" && !req.headers["mcp-session-id"]) {
 res.status(503).json({
 jsonrpc: "2.0",
 error: { code: -32004, message: "Server is shutting down" },
 id: null,
 });
 return;
 }
 next();
 });

 // Wait for active sessions to complete (max 30 seconds)
 const deadline = Date.now() + 30000;
 while (sessions.size > 0 && Date.now() setTimeout(resolve, 1000));
 }

 // Close remaining sessions
 for (const [id, transport] of sessions) {
 await transport.close();
 sessions.delete(id);
 }

 process.exit(0);
});
```

The pattern is to stop accepting new sessions, wait for existing sessions to finish (with a deadline), then force-close anything still open. The 30-second deadline matches Kubernetes' default `terminationGracePeriodSeconds`.

### Troubleshooting Production MCP Server Failures

The same handful of failure modes account for most production incidents with Streamable HTTP MCP servers. Knowing the signature of each makes them quick to diagnose.

**SSE responses arrive in batches instead of streaming.** The symptom is that Claude appears to hang for several seconds, then receives the entire tool output in one burst. The cause is response buffering at the reverse proxy. With nginx, set `proxy_buffering off` and `proxy_cache off` on the `/mcp` location. With Caddy, set `flush_interval -1` on the `reverse_proxy` directive. If you are running behind a CDN like Cloudflare, also disable buffering at the CDN edge or bypass the CDN entirely for the MCP endpoint. After the change, verify with `curl -N -H "Accept: text/event-stream"` against a streaming tool to confirm events arrive incrementally.

**Sessions break after a deployment.** Symptom: clients get `404 Session not found` errors after a rolling restart. Cause: session state lives in a `Map` inside the process, so a restarted pod has no memory of sessions created on its predecessor. Either pin sessions to a single replica with deployment strategy `Recreate` (acceptable for low-traffic internal tools), or move session state to Redis so any pod can hydrate any session. The Redis approach is the only one that survives autoscaling.

**Random `502 Bad Gateway` errors under load.** Symptom: most requests succeed but a fraction return `502` or `connection reset by peer`. Cause is almost always one of three things. The Node process is hitting its file descriptor limit (raise with `ulimit -n 65535` in the container). The reverse proxy `proxy_read_timeout` is shorter than the slowest tool call (raise to at least 300 seconds for tools that wait on databases). Or the Node event loop is blocked by synchronous code in a tool implementation, which causes health checks to fail and Kubernetes to start killing pods. Audit any tool that does CPU-bound work and move it to a worker thread.

**`Mcp-Session-Id` header missing on every request.** Symptom: every request creates a new session and the session map grows without bound. Cause is usually a reverse proxy stripping unknown headers. Allowlist `Mcp-Session-Id` and `MCP-Protocol-Version` explicitly in the proxy configuration. In nginx, no action is needed by default, but some hardened configurations strip non-standard headers. In Cloudflare, custom headers are passed through unless a Transform Rule removes them.

**Container OOMKilled after a few hours.** Symptom: pods restart on a roughly constant cadence with `OOMKilled` in `kubectl describe`. Cause is almost always one of: an unbounded session map (sessions are never cleaned up), a leaking database connection pool, or a tool that loads large payloads into memory without streaming. Add the `transport.onclose` handler from the earlier example to clean up sessions, set a maximum age on idle sessions (close after 30 minutes of inactivity), and stream large query results instead of buffering them.

**Authentication works locally but fails in production.** Symptom: requests succeed during development and return `401` after deployment. Cause is usually the reverse proxy stripping or rewriting the `Authorization` header. Some proxies treat `Authorization` specially when they have their own auth modules enabled. Verify with `curl -v` from inside the cluster, then from outside, and compare the headers the MCP server actually receives by logging `req.headers` in the `authenticate` middleware.

**Tool calls succeed but Claude reports them as failed.** Symptom: the server logs show a `200` response and a valid result, but Claude tells the user the tool call failed. Cause is usually that the tool returned an error message in `content` without setting `isError: true`. Claude treats unflagged content as a successful result, so an error message becomes part of the apparent answer. Always set `isError: true` on the response when a tool call fails, even if you also include a human-readable explanation in `content`.

### Common Pitfalls When Moving from Stdio to HTTP

The transition from stdio to Streamable HTTP introduces a class of bugs that do not exist in the stdio model. They are easy to avoid once you have seen them, and painful to debug for the first time.

**Logging to stdout.** In stdio mode, anything written to stdout is part of the protocol channel, and a stray `console.log` corrupts the JSON-RPC stream. In HTTP mode, stdout is just stdout, and `console.log` is harmless. The pitfall is that code written for stdio uses `console.error` defensively, and code written for HTTP forgets the discipline. If you ever support both transports, or you migrate a server from one to the other, audit every log statement. The safe rule is `console.error` everywhere, always.

**Forgetting `MCP-Protocol-Version`.** Since the June 2025 specification, HTTP-based MCP connections must include an `MCP-Protocol-Version` header on every request. Older client SDKs do not send it, and older server SDKs do not check for it. The result is a connection that initializes successfully and then misbehaves on specific operations because the two sides have negotiated different protocol versions. Pin both client and server SDKs to the same released version, and reject requests without the header in production.

**Session affinity that is not actually session affinity.** A load balancer that hashes on source IP looks like session affinity until two developers behind the same NAT both connect. Then both their sessions land on the same backend and both work, but a third developer on a different network gets a fresh session on a different backend, and tools that depend on shared session state fail mysteriously. Hash on `Mcp-Session-Id` or use a stickiness cookie that the load balancer sets on the initial response. Source IP hashing is not enough.

**Health checks that do not check health.** A `/health` endpoint that returns `200` whenever the process is running is worse than no health check, because it lets a broken pod stay in the load balancer rotation. A useful health check verifies the things that actually matter: the database connection is alive, the upstream API is reachable, and the event loop is responsive. Distinguish liveness (the process exists) from readiness (the process can serve a real request). Wire the readiness probe to `/ready` and have it actually exercise dependencies.

**Treating the reverse proxy as optional.** A direct deployment of Node on port 443 with TLS handled in-process is technically possible and frequently regretted. Reverse proxies handle TLS termination, HTTP/2, connection limits, request buffering, and graceful shutdown coordination far better than any application server. They are also easier to reconfigure without redeploying the application. If your production environment does not already have a reverse proxy, add one before you add anything else.

**Skipping authentication "until later".** An MCP server without authentication, exposed on the open internet, is a remote code execution vulnerability dressed up as a developer tool. If your tools touch any system that matters, add authentication on day one. Bearer tokens are the floor. OAuth 2.1 is the ceiling. There is no tier in between worth deploying.

## The Lesson

Moving an MCP server to production is not primarily a coding challenge. The protocol is the same. The tools are the same. The messages are the same JSON-RPC payloads.

The real challenge is operational. It is deciding how to authenticate clients and what happens when authentication fails. It is knowing that your server handles 50 concurrent sessions but understanding what happens at 500. It is having metrics that tell you a tool's 99th percentile latency jumped from 200ms to 2 seconds before your users notice.

Every production system, MCP or otherwise, follows the same pattern. The protocol is the easy part. The deployment, monitoring, security, and operational practices around the protocol are what make it production-ready.

If you are building MCP servers that will serve a team, start with the patterns in this guide. Streamable HTTP transport for remote access. Authentication middleware from day one. Health checks and metrics before you deploy. Rate limiting before you need it.

And read the companion guide on [MCP server authentication and security](/guides/mcp-server-authentication-security) before you expose any tools that touch sensitive data. Authentication is not optional. It is the first thing to get right.

## Conclusion

This journey starts with a server that runs on a laptop and serves one person. It ends with a containerised service behind a reverse proxy, authenticated with Bearer tokens, monitored with Prometheus, and scaled across three replicas in Kubernetes.

The path from localhost to production is well-worn. HTTP transport gives you the network layer. Authentication gives you access control. Rate limiting gives you safety margins. Health checks give you automated recovery. Metrics give you visibility. Container packaging gives you reproducible deployments.

None of these concepts are new to anyone who has deployed web services. The insight is that MCP servers are web services. They speak JSON-RPC instead of REST, and they serve AI clients instead of browsers, but the operational requirements are identical.

Build your MCP server with the same rigour you would apply to any production API. Then go further. Read about [building MCP servers in Rust](/guides/build-mcp-server-rust) for the performance characteristics of a systems language. Read about [authentication and security patterns](/guides/mcp-server-authentication-security) if your tools access sensitive data.

The protocol is powerful. The tools are capable. The missing piece for most teams is the operational maturity to run them reliably. This guide aims to fill that gap.

## Further Reading

- [Awesome AI Agent Governance](https://github.com/systempromptio/awesome-ai-agent-governance) - A curated list of tools, frameworks, and standards for governing AI agents in production.

 

 

 
 
## References & Sources

 
 [1]
 [MCP Transports Specification](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports)
 modelcontextprotocol.io

 [2]
 [MCP Build Server Guide](https://modelcontextprotocol.io/docs/develop/build-server)
 modelcontextprotocol.io

 [3]
 [systemprompt.io Platform](https://systemprompt.io)
 systemprompt.io

 
 
## Frequently asked questions

 
 
 How do I deploy an MCP server to production with HTTP transport?
 Switch from stdio to Streamable HTTP transport by exposing your MCP server on an HTTP endpoint (typically /mcp) using the official MCP SDK's StreamableHTTPServerTransport class. The server handles JSON-RPC requests as POST bodies and supports Server-Sent Events for streaming responses. Session management is handled through the Mcp-Session-Id header, and you should deploy behind a reverse proxy like nginx or Caddy for TLS termination.

 
 
 Can I run an MCP server in Docker and Kubernetes?
 Yes. Use a multi-stage Docker build with a non-root user for security, and include a HEALTHCHECK directive for automated failure detection. For Kubernetes, deploy with liveness probes on /health and readiness probes on /ready, store API keys in Kubernetes secrets, and set resource limits to prevent unbounded memory or CPU consumption. A typical deployment runs 3 replicas with 128Mi-512Mi memory per pod.

 
 
 How do I monitor MCP server performance and tool call latency?
 Implement three layers of observability: health check endpoints (/health for liveness, /ready for readiness), structured JSON request logging with timing and session IDs, and Prometheus metrics. Expose counters for total tool calls, histograms for tool call duration with appropriate buckets, and gauges for active session counts on a /metrics endpoint.

 
 
 How do I scale an MCP server to handle multiple concurrent users?
 A single MCP server instance can handle 50+ concurrent sessions since tool calls are typically I/O-bound. For horizontal scaling, run multiple instances behind a load balancer with session affinity using the Mcp-Session-Id header. In nginx, use hash $http_mcp_session_id consistent to route sessions to the same backend. For session persistence across restarts, move session state to Redis.

 
 
 How do I add authentication and rate limiting to an MCP server?
 Add Express middleware that validates Bearer tokens from the Authorization header before requests reach the MCP handler. Store valid API keys in environment variables and return proper JSON-RPC error responses (code -32001 for missing auth, -32002 for invalid credentials). For rate limiting, implement a sliding window limiter keyed on the API key with headers like X-RateLimit-Remaining, starting at 100 requests per minute.

 
 
 What is the best architecture for hosting MCP servers in production?
 Place a reverse proxy (Caddy or nginx) in front of your MCP server to handle TLS termination, connection limits, and request buffering. Keep the MCP server thin: it should validate inputs, call backend services, and format results, while business logic lives in separate backend APIs. Disable response buffering in the proxy (flush_interval -1 in Caddy) to support SSE streaming, and implement graceful shutdown handling for SIGTERM signals.

 
 

 
 
### Continue Reading

 
 [Claude Code
 
#### AI Code Review with Claude Code: Automated PR Reviews That Catch Real Bugs

 Set up AI code review with Claude Code for GitHub pull requests. Automated reviews that catch security issues, logic errors, and performance problems before merge.
 26 min read](/guides/ai-code-review-claude)
 [Claude Code
 
#### How to Use Claude Code: The Complete Beginner's Guide

 Step-by-step guide to using Claude Code effectively. Install, run your first session, set up CLAUDE.md, and avoid the most common beginner mistakes.
 24 min read](/guides/how-to-use-claude-code)
 [Claude Code
 
#### Claude Code Agent Teams: Parallel Agents, Worktrees, and Multi-Task Orchestration

 Agent teams use 7x the tokens of a single session. Here is when that trade-off is worth it, the failure modes nobody warns you about, and the patterns that actually work.
 20 min read](/guides/claude-code-agent-teams)
 

 
 
 
 Book a meeting
 
## Let's talk your implementation

 Discuss technical implementation, enterprise licensing, or custom integrations with the founder. For teams that have evaluated [the template](https://github.com/systempromptio/systemprompt-template) and are ready to move forward.

 
 
 
- Technical implementation
 Deployment architecture, IdP integration, SIEM pipelines, and custom extensions
 
- Enterprise licensing
 Volume licensing, SLA guarantees, and perpetual licence terms under BSL-1.1
 
- Custom integrations
 Rust extensions, custom governance rules, and provider-specific configurations
 
 
 
 
 30 minutes with the founder. For teams ready to move beyond evaluation.
 

 
 
 
 
 
 1
 You
 
 
 
 
 
 2
 Team
 
 
 
 
 
 3
 Details
 
 
 
 
 
 
 
 
 
 
### You're in. Check your inbox.

 We've sent you an email with a link to book your 30-minute call. Check your inbox.

 [While you wait: How to roll out Claude across your organisation](/guides/claude-code-organisation-rollout)
 
 
 
 
 
 No spam
 
 
 
 Book instantly
 
 
 
 30-min call
