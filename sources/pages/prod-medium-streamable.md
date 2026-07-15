---
slug: prod-medium-streamable
url: https://medium.com/ai-in-plain-english/implementing-mcp-with-streamable-http-transport-in-prod-23ca9c6731ca
title: Implementing MCP with Streamable HTTP Transport in prod | by DhanushKumar | Mar, 2026 | Artificial Intelligence in Plain English
author: 
fetched_at: 2026-04-30T20:53:18Z
sha256: f290a2fdaafa0453205a3d2224b54c3144bcd6f2f26e22c2f426cce945ccb7ea
license: blog-fair-use
tier: 4
---
Implementing MCP with Streamable HTTP Transport in prod | by DhanushKumar | Mar, 2026 | Artificial Intelligence in Plain English**[Sitemap](/sitemap/sitemap.xml)[Open in app](https://play.google.com/store/apps/details?id=com.medium.reader&referrer=utm_source%3DmobileNavBar&source=post_page---top_nav_layout_nav-----------------------------------------)

[Sign in](https://medium.com/m/signin?operation=login&redirect=https%3A%2F%2Fai.plainenglish.io%2Fimplementing-mcp-with-streamable-http-transport-in-prod-23ca9c6731ca&source=post_page---top_nav_layout_nav-----------------------global_nav------------------)

[https://medium.com/?source=post_page---top_nav_layout_nav-----------------------------------------](https://medium.com/?source=post_page---top_nav_layout_nav-----------------------------------------)*[Write](https://medium.com/m/signin?operation=register&redirect=https%3A%2F%2Fmedium.com%2Fnew-story&source=---top_nav_layout_nav-----------------------new_post_topnav------------------)[Search](https://medium.com/search?source=post_page---top_nav_layout_nav-----------------------------------------)

[Sign in](https://medium.com/m/signin?operation=login&redirect=https%3A%2F%2Fai.plainenglish.io%2Fimplementing-mcp-with-streamable-http-transport-in-prod-23ca9c6731ca&source=post_page---top_nav_layout_nav-----------------------global_nav------------------)

[## Artificial Intelligence in Plain English](https://ai.plainenglish.io/?source=post_page---publication_nav-78d064101951-23ca9c6731ca---------------------------------------)·

[https://ai.plainenglish.io/?source=post_page---post_publication_sidebar-78d064101951-23ca9c6731ca---------------------------------------](https://ai.plainenglish.io/?source=post_page---post_publication_sidebar-78d064101951-23ca9c6731ca---------------------------------------)New AI, ML and Data Science articles every day. Follow to join our 3.5M+ monthly readers.

# Implementing MCP with Streamable HTTP Transport in prod

## Overview :
[https://medium.com/@danushidk507?source=post_page---byline--23ca9c6731ca---------------------------------------](https://medium.com/@danushidk507?source=post_page---byline--23ca9c6731ca---------------------------------------)[DhanushKumar](https://medium.com/@danushidk507?source=post_page---byline--23ca9c6731ca---------------------------------------)16 min read·Mar 22, 2026[https://medium.com/m/signin?actionUrl=https%3A%2F%2Fmedium.com%2F_%2Fvote%2Fai-in-plain-english%2F23ca9c6731ca&operation=register&redirect=https%3A%2F%2Fai.plainenglish.io%2Fimplementing-mcp-with-streamable-http-transport-in-prod-23ca9c6731ca&user=DhanushKumar&userId=bef30f7c46ed&source=---header_actions--23ca9c6731ca---------------------clap_footer------------------](https://medium.com/m/signin?actionUrl=https%3A%2F%2Fmedium.com%2F_%2Fvote%2Fai-in-plain-english%2F23ca9c6731ca&operation=register&redirect=https%3A%2F%2Fai.plainenglish.io%2Fimplementing-mcp-with-streamable-http-transport-in-prod-23ca9c6731ca&user=DhanushKumar&userId=bef30f7c46ed&source=---header_actions--23ca9c6731ca---------------------clap_footer------------------)--

[https://medium.com/m/signin?actionUrl=https%3A%2F%2Fmedium.com%2F_%2Fbookmark%2Fp%2F23ca9c6731ca&operation=register&redirect=https%3A%2F%2Fai.plainenglish.io%2Fimplementing-mcp-with-streamable-http-transport-in-prod-23ca9c6731ca&source=---header_actions--23ca9c6731ca---------------------bookmark_footer------------------](https://medium.com/m/signin?actionUrl=https%3A%2F%2Fmedium.com%2F_%2Fbookmark%2Fp%2F23ca9c6731ca&operation=register&redirect=https%3A%2F%2Fai.plainenglish.io%2Fimplementing-mcp-with-streamable-http-transport-in-prod-23ca9c6731ca&source=---header_actions--23ca9c6731ca---------------------bookmark_footer------------------)[https://medium.com/m/signin?actionUrl=https%3A%2F%2Fmedium.com%2Fplans%3Fdimension%3Dpost_audio_button%26postId%3D23ca9c6731ca&operation=register&redirect=https%3A%2F%2Fai.plainenglish.io%2Fimplementing-mcp-with-streamable-http-transport-in-prod-23ca9c6731ca&source=---header_actions--23ca9c6731ca---------------------post_audio_button------------------](https://medium.com/m/signin?actionUrl=https%3A%2F%2Fmedium.com%2Fplans%3Fdimension%3Dpost_audio_button%26postId%3D23ca9c6731ca&operation=register&redirect=https%3A%2F%2Fai.plainenglish.io%2Fimplementing-mcp-with-streamable-http-transport-in-prod-23ca9c6731ca&source=---header_actions--23ca9c6731ca---------------------post_audio_button------------------)The Model Context Protocol (MCP) is an open standard introduced by Anthropic in late 2024 to connect AI systems with external data and services. It provides a JSON-RPC 2.0 based message protocol that explicitly separates tool invocation from natural language prompts. In practice, an MCP Host** (for example an AI assistant or IDE) embeds an MCP Client, which speaks a uniform JSON-RPC format to one or more **MCP Servers**. Each MCP Server exposes a specific capability (such as a database query, file system access, or web API) and mediates access to underlying resources. This design is often likened to a “USB-C for AI” — a universal adapter that lets any AI agent call any tool through the same protocol. By late 2025, MCP support had rapidly become widespread across the industry, with major AI platforms (OpenAI’s ChatGPT, Google DeepMind, Microsoft Copilot, etc.) implementing the standard.

Under the hood, MCP formalizes communication and lifecycle phases. A client first sends an `initialize` JSON-RPC request declaring its version and capabilities; the server responds with its own capabilities and a session ID (if session state is used). After this handshake, the client can send `tools/list` requests to discover available tools, and `tools/call` requests to invoke them. Each response is a JSON object with `content` (an array of result blocks) and an `isError` flag according to the schema. MCP defines standard transports: a local subprocess mode using STDIO, and a streamable HTTP* mode (HTTP POST with optional SSE for streaming).In HTTP mode, the server exposes a single endpoint (e.g., /mcp) that accepts POST request carrying JSON-RPC messages and can optionally return a streaming SSE responses. Implementations must validate `Origin`, bind only to localhost by default, and require authentication to prevent DNS rebinding or unauthorized access.

A core best practice is to use MCP Gateway — a reverse proxy and registry that stis between AI clients and MCP servers. The gateway provides a single entry point (for example, mcp.mycompany.com) under which all tool endpoints are namespaced (e.g., `/crm/*` for a CRM server, `/db/*` for a database server).This simplifies client config and centralizes control : a gateway can maintain a service registry (often with UI 0 so new tools are discovered dynamically. It also allows centralized load balancing , health checking and unified policy enforcement : with one gateway you can apply authentication , rate limits , logging for every tool call, rather than each server handling it separately .In fact , ByteBridge notes that production MCP deployments should *be designed around a gateway architecture* to keep things organized; all MCP requests from clients should funnel through this controlled entry point, making security, monitoring, and scaling far more tractable. Open-source gateways (often built on NGINX or FastAPI) and commercial offerings (such as Peta by ByteBridge) already provide these features, including secret management and human-in-the-loop approvals.

Press enter or click to view image in full size*
### MCP in Prod :
The MCP offers a streamable HTTP transport that turns the MCP server into a standard web API. Instead of using the older `stdio` transport (which only works for local processess), streamble HTTP allows any MCP server to be hosted like a normal web service. In practice, the server listens on a HTTP(s) endpoint (e.g., /mcp), and then the client communication via HTTP POST and Server-sent Events (SSE) .As one practitioner notes, using `transport="streamable-http"` makes your MCP server “production-ready” it can be deployed anywhere , scales like a REST API and maintains real time bidirectional communication over HTTP .This solves the limitations of stdio (desktop-only , no web support) by fitting into the existing cloud infra.

Under** streamable HTTP**, the MCP session begin with an HTTP `initialize` request. .The server responds with a JSON payload and also sets an `MCP-Session-Id` header, establishing a session .The client then makes all further calls with that `MCP-Session-Id` header . To receive asynchronous events (such as progress updates or multi-part results), the client also opens a separate HTTP GET to a designated SSE endpoint (often the same /mcp path).In effect , the client has two connections: a POST channel for sending requests and a long-lived GET (Accept : text/event-stream) for receivin SSE messages.The server can choose to answer each **POST** with either a direct J**SON response **(for quick operations) or switch to SSE mode ( `Content-Type: text/event-stream`) to push multiple updates. This pattern is detailed in the spec : an SSE stream allows sending a sequence of JSON messages ,each prefixed with `id: `, followed by newline and JSON content. In summary , streamable HTTP is session-based and full duplex : the client constantly polls the GET SSE stream ,while sending new instructions via POST .

Press enter or click to view image in full size
### End to End Architecture with Streamable HTTP
A typical prod setup uses a standard web architecture. The AI Agent ( MCP Client) and the MCP servers sit behind an API gateway or ingress .For example, there might ocnfigure a gateway with one hostname (`api.example.com`) and route `/mcp` to your MCP server service. The MCP server itself listens on port 8000(HTTP) .The agent initiates an MCP session by POSTing to `https://api.example.com/mcp`, receiving a session ID , and then opens an SSE Stream on the same path.The gateway should support sticky sessions or properly route SSE connections to the same backend .Behing the scences , load balancers or kubernetes can run multiple replicas .Becuase SSE connections are long-lived , use HTTP/2 or HTTP/1.1 with keep-alive and consider increasing timeout and max connections .Crucially ,treat each MCP server as any stateful microsservices : log each request with session ID , monitor open SSE connections and ensure the network allows bidirectional streaming.

Security and reliability aspects are like any web API. USe HTTPS/TLS so that both the POST requests and SSE responses are encrypted.Validate the `Origin` header on the server to mitigate CSRF on the SSE endpoint . Aunthenticate every request : intial MCP implementations often lacked authentication (one “admin” token for all) which is dangerous in multi-tenant use .In prod, issue each client a JWT or OAuth2 Toke, and uses FastMCP’s a built-in OAuth support if needed.For example , the PythonFastMCP class allows to plugin a `TokenVerifier` that checks bearer tokens according to the MCP auth spec.Enfore fine-grained authorizations :only allow each agent to call the tools it should (role-based access) .Configure rate -limiting on the gateway to precent a runaway agent from overloading tools .

Load balancing works as usual : you can run multiple MCP server instances behind a load balancer or kubernetes service .Ensure each server instances can share workload ; streaming mode doesn’t preclude horizontal scaling. It may need session affinity for the SSE stream or use a sticky session cookie. Alternatively , it can centralize state (e.g., put all the session state in Redis) so any instance can pick up where another left off.For high availability , place health checks on `/health` or `/ready` endpoints (exposes by FastMCP or custom) .Monitor the application with standard tools : log each tool invocation (with session ID , tool name, params , result) and emit metrics (requests sec, SSE streas open, error rates) to cloudwatch.In brief, observer MCP servers the same way you would any HTTP microservice.

In summary, the MCP architecture in production typically involves AI agent clients connecting to a central gateway, which routes requests to individual MCP server microservices. Each server handles a specific resource or API. All components communicate via JSON-RPC over TCP or HTTP/SSE with clearly defined JSON schemas. The gateway abstracts away complexity (and can act as a policy enforcement point), while MCP servers focus on exposing business logic or data. This modular design enables scalability and security: new tools are just new servers registered with the gateway, without changing the AI client.

Press enter or click to view image in full sizePress enter or click to view image in full size
### MCP Streamable HTTP — Production Workflow Diagram

```
+-----------------------+**| AI AGENT / LLM |
| (LangGraph / Backend) |
+----------+------------+
 |
 | 1. JSON-RPC POST (initialize)
 v
+-----------------------------+
| API GATEWAY / LOAD BALANCER |
| (Auth, Rate Limit, Routing) |
+-------------+---------------+
 |
 v
+-----------------------------+
| MCP SERVER |
| - Tool Registry |
| - Session Manager |
| - Execution Engine |
+------+----------------------+
 | 
 | 2. Open SSE Stream (GET /events)
 v
+-----------------------------+
| STREAM CHANNEL (SSE) |
| (Server → Client Updates) |
+-----------------------------+

 |
 | 3. Tool Invocation
 v

+-----------------------------+
| EXECUTION LAYER |
|-----------------------------|
| External APIs |
| Vector DB (RAG) |
| Databases |
| ML Models / Services |
+-----------------------------+

 |
 | 4. Streaming Results
 v

+-----------------------------+
| STREAM RESPONSE (SSE) |
| Partial + Final Outputs |
+-----------------------------+

 |
 v
+-----------------------+
| AI AGENT |
| (Consumes Stream) |
+-----------------------+
```

### MCP STDIO — Local Workflow Diagram

```
+--------------------------+
| AI AGENT / CLIENT |
| (Claude Desktop / IDE) |
+------------+-------------+
 |
 | Spawn Process
 v
+-----------------------------+
| MCP SERVER |
| (Local Subprocess) |
+-------------+---------------+
 |
 -------------------------
 | | |
 v v v
+--------+ +--------+ +--------+
| stdin | | stdout | | stderr |
| (req) | | (resp) | | (logs) |
+--------+ +--------+ +--------+

 |
 | Tool Execution
 v

+-----------------------------+
| LOCAL EXECUTION LAYER |
|-----------------------------|
| File System |
| Local APIs |
| CLI Tools |
| Local Databases |
+-----------------------------+

 |
 | Response via stdout
 v

+--------------------------+
| AI AGENT / CLIENT |
+--------------------------+
```

### End-to-End MCP Server Example (Python)
To illustrate a concrete implementation, consider building a production-grade MCP server in Python. The official [MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk) provides a convenient framework (e.g. `FastMCP`) that fully implements the protocol and transports. Below is a simplified example of a file-system MCP server. This server runs over HTTP (SSE-enabled) and exposes two tools: `list_files` and `read_file`, confined to a secure base directory. It includes error handling and enforces path restrictions to prevent unauthorized access.

```
import os
from pathlib import Path
from typing import List
from mcp.server.fastmcp import FastMCP

# Define the base directory (workspace) for file operations
BASE_DIR = Path("./workspace").resolve()
if not BASE_DIR.exists():
 BASE_DIR.mkdir()

mcp = FastMCP(name="FileServer", json_response=True)

@mcp.tool()
def list_files() -> dict:
 """List files in the base directory."""
 try:
 entries = [f.name for f in BASE_DIR.iterdir() if f.is_file()]
 text = "Files: " + ", ".join(entries)
 # Return content as per MCP spec: array of {type, text}
 return {"content": [{"type": "text", "text": text}], "isError": False}
 except Exception as e:
 error_text = f"Error listing files: {e}"
 return {"content": [{"type": "text", "text": error_text}], "isError": True}

@mcp.tool()
def read_file(path: str) -> dict:
 """
 Read the contents of a file within the base directory.
 Returns the file text or an error if access is invalid.
 """
 # Resolve the requested path securely within BASE_DIR
 target = (BASE_DIR / path).resolve()
 # Security check: ensure target is a subpath of BASE_DIR
 if not str(target).startswith(str(BASE_DIR)):
 return {"content": [{"type": "text", "text": "Access denied"}], "isError": True}
 if not target.exists():
 return {"content": [{"type": "text", "text": f"File '{path}' not found"}], "isError": True}
 try:
 content = target.read_text(encoding="utf-8")
 return {"content": [{"type": "text", "text": content}], "isError": False}
 except Exception as e:
 return {"content": [{"type": "text", "text": f"Read error: {e}"}], "isError": True}

if __name__ == "__main__":
 # Run the MCP server on port 8000 with Streamable HTTP transport
 # (the SDK handles HTTP+SSE as per MCP spec).
 mcp.run(transport="streamable-http", port=8000)
```
This code uses `FastMCP`, which under the hood manages JSON-RPC framing and lifecycle.It declares each tool with the `@mcp.tool()` decorator and returns results that match the MCP schema (an object with `content` and `isError`). The example enforces security by requiring that any file path lies under `BASE_DIR`; otherwise it returns an `"Access denied"` error. This prevents directory traversal and data leakage. In a real system, each tool would include thorough input validation and exception handling as shown. By using the SDK and structured JSON responses, this server is immediately compatible with any MCP client or gateway.

## Get DhanushKumar’s stories in your inbox
Join Medium for free to get updates from this writer.

Remember me for faster sign in

A client (e.g. an AI host) would first call the `initialize` method to negotiate protocol version and capabilities, then use `tools/list` to see `list_files` and `read_file`, and finally issue `tools/call` requests like:

```
{"jsonrpc": "2.0", "id": 2, "method": "tools/call", "params": {"name": "read_file", "arguments": {"path": "report.txt"}}}
```
and the server would reply with a result object containing the file content or error text .The protocol ensures every message is well-typed and that erros are reported formally (e.g. JSON-RPC error for method not found, or an `isError: true` in the result for execution errors).

### Deployment and Infrastructure
In production, MCP servers should be containerized and orchestrated like any critical microservice. The example Python server above can be packaged with a minimal Dockerfile. For instance, using a slim Python base image and adding a non-root user enhances security. A sample Dockerfile might be:

```
# Dockerfile
FROM python:3.11-slim AS base
# Create a dedicated user for MCP server
RUN groupadd -g 1001 mcpuser && useradd -u 1001 -g mcpuser mcpuser
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
# Copy application code
COPY . .
# Run as non-root for security
USER mcpuser
EXPOSE 8000
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
```
This container runs the server on port 8000, as the non-root `mcpuser` user. A healthcheck (not shown) should verify the `/health` endpoint regularly. When running in Kubernetes, we deploy this container with a Deployment spec. For example, we would define several replicas behind a Service, enable rolling updates, and enforce strict Pod security. A snippet:

```
apiVersion: apps/v1
kind: Deployment
metadata:
 name: mcp-fileserver
 namespace: ai-agents
spec:
 replicas: 3
 strategy:
 type: RollingUpdate
 rollingUpdate:
 maxSurge: 1
 maxUnavailable: 0
 selector:
 matchLabels:
 app: mcp-fileserver
 template:
 metadata:
 labels:
 app: mcp-fileserver
 spec:
 serviceAccountName: mcp-service-account
 securityContext:
 runAsNonRoot: true
 runAsUser: 1001
 fsGroup: 1001
 containers:
 - name: fileserver
 image: myregistry/mcp-fileserver:v1
 ports:
 - containerPort: 8000
 resources:
 requests:
 cpu: 100m
 memory: 128Mi
 limits:
 cpu: 500m
 memory: 256Mi
 livenessProbe:
 httpGet:
 path: /health
 port: 8000
 initialDelaySeconds: 15
 periodSeconds: 20
 readinessProbe:
 httpGet:
 path: /ready
 port: 8000
 initialDelaySeconds: 5
 periodSeconds: 10
 env:
 - name: PYTHONUNBUFFERED
 value: "1"
```
This Kubernetes configuration runs 3 pods of the MCP server with a rolling update strategy. It sets `runAsNonRoot` and a fixed `runAsUser` for security, mounts no sensitive volumes, and includes liveness/readiness probes. These practices (non-root user, resource quotas, health checks) are advised for production MCP containers.Horizontal Pod Autoscaling (based on CPU or custom metrics) can be added to scale pods automatically. The MCP Gateway itself would similarly run behind a Service or Ingress.

Networking-wise, one can expose the gateway on the public API (securely behind an API gateway or ingress controller) while binding internal MCP servers to localhost or a secure overlay network. Wildcard DNS or a service mesh can route e.g. `mcp.company.com/file/` to the file server and `.../db/` to a database tool. Each service should use TLS and token-based auth (see below).

### Observability, Monitoring, and Reliability
MCP services must be treated as mission-critical microservices. This means robust observability and metrics. ByteBridge emphasizes “logging at every layer” and correlating logs with unique request or trace IDs. In practice, instrument each component (AI client, gateway, each MCP server) to log every tool invocation: include timestamps, tool name, parameters (redacting secrets), session or user IDs, and results or errors. Push these logs to a centralized aggregator (ELK, Splunk, or cloud logging). Use structured logging (JSON lines) so that logs from different services can be easily joined.

Expose Prometheus-style metrics for key KPIs: request counts per tool, latency percentiles, error rates, active sessions, SSE connection counts, etc. For instance, monitor “tools_called” counters, “tool_latency_seconds” histograms, and track token usage per session. Health-check endpoints should return OK when the server is ready. Use distributed tracing (OpenTelemetry) if possible to visualize end-to-end flows from the user query through the LLM to tool calls. This instrumentation helps quickly pinpoint failures (authentication error vs. network vs. code bug).

Testing and debugging tools are important. One can build an “MCP Inspector” CLI (or use existing ones) to simulate client behavior, test registrations, and validate auth flows. In pre-production, enable verbose logging of prompts, tool calls, and intermediate results (as long as data privacy is controlled). For production, consider audit-logging every action (which agent/tool/user did what) in an immutable store or SIEM for compliance. In summary, treat MCP like any distributed service: set up dashboards, alerts on error spikes, and end-to-end tracing, so that one can see whether an issue was with the LLM’s request, the gateway, or a specific tool service.

### Security, Multi-tenancy, and Advanced Concepts
Running AI agents on real data poses unique security challenges. Out-of-the-box, early MCP implementations had minimal security (often no auth) and relied on a single admin token. In production, strong authentication and authorization** are mandatory. Each client/agent should authenticate (e.g. present a user or API JWT) on every call; do not use a single master key for all users. Configure the gateway to validate tokens (OAuth 2.1 or similar) and extract the user identity. Implement **role-based access control** (RBAC) such that only authorized users or agents may invoke certain tools or data. ByteBridge warns of the “confused deputy” problem when one token is shared — the server cannot tell one end-user from another, so an attacker or malicious agent could abuse elevated rights. Instead, issue scoped, short-lived tokens per user or session, and have the gateway or servers check permissions (for example, only the HR role can call `/payroll/*` tools).

Data context must also be isolated per user or session. If the MCP server is multi-tenant (serving many users), design it so that each request includes a tenant ID or user ID, and enforce filtering at the database/API level. For instance, if using one “search_documents” tool for all users, add a `user_id` field to queries or maintain separate databases per tenant. ByteBridge advises that session data (conversation history, memory) should never mix between users. For stateful tools that hold memory or caches, you may need to run separate instances per user or partition memory by user ID. Test thoroughly: ensure one user’s session cannot retrieve another’s data or crash their context.

Credentials and secrets must never flow through the untrusted LLM client. The base MCP spec (as of 2024) did not provide a way for servers to obtain third-party OAuth tokens securely, leading to insecure workarounds. Recent proposals (and implementations by vendors like Arcade) fix this via **elicitation**. In essence, if a tool needs OAuth credentials (e.g. to call Gmail or GitHub), the server returns an ElicitationRequired* response with a special URL mode. The client then opens a browser to that URL, letting the user authenticate; the server receives the callback and obtains the token on the server side. Because the flow uses a browser redirect, the LLM client never sees the secret token — it only receives a confirmation after completion. This “URL elicitation” pattern enforces clear trust boundaries and has become part of the 2025 MCP spec. We recommend using the latest MCP SDK and enabling the `elicitation` capability; for example, in Python one can raise `UrlElicitationRequiredError` with parameters as shown in the SDK example.

Encryption-in-transit is a must: run all MCP HTTP endpoints over TLS, even internally. Validate the HTTP `Origin` header on SSE connections to avoid CSRF. On a local client (e.g. desktop app) you should still use localhost binding rather than wildcard. For secret management, do **not** hardcode API keys in tool code. Instead, use a secrets vault (AWS Secrets Manager, HashiCorp Vault, etc.) that the server accesses at runtime. Per-session short-lived credentials (via OAuth refresh tokens) are safest. Implement per-tool quotas and rate-limits in the gateway or server to prevent abuse; for example, allow at most *N* calls per minute per user to heavy APIs. Set sensible timeouts on each call so one misbehaving tool doesn’t hang the client.

Another advanced consideration is **context longevity**. MCP sessions may hold context or memory. ByteBridge notes that stuffing too much context into LLM prompts is costly and risky. Instead of appending lengthy document data into every message, use dedicated memory stores. For example, an MCP memory server (such as an open-source “postg-mem” backed by PostgreSQL) can retain conversation history or knowledge graphs. The agent writes important facts to this store and reads them back by query, rather than carrying them in prompt tokens. This externalizes long-term memory and keeps prompt sizes small. Similarly, if the protocol’s streaming transport (SSE) is not suitable for your environment, you might use stateless HTTP calls with an external session database (e.g. Redis) to remember conversation state between POSTs. Just ensure that any session store uses strong encryption at rest, and that sessions are invalidated after timeout to limit exposure.

### Best Practices and Next Steps
In summary, a production MCP deployment involves solid software engineering and DevOps discipline. Use modern ML tooling: containerize each server, orchestrate with Kubernetes or serverless in a secure VPC, and use automated CI/CD. Require TLS everywhere and authenticate all connections. Leverage the MCP specification fully: implement session headers, version negotiation, and capabilities so you can evolve without breaking clients. Keep the MCP SDK up to date. Enforce a human-in-the-loop for critical actions (the MCP spec even provides notifications/prompts that clients should use to ask user confirmation for sensitive ops). Continuously audit and test: for example, simulate a malicious agent trying to break out of the context or access unauthorized tools.

For end-to-end validation, one can integrate the MCP setup with an agent framework. For instance, an AI can be tasked to call these file tools and verify the outputs. The MCP Python SDK even includes an “inspector” CLI for testing servers. Monitoring should include not just infrastructure metrics but also ML-specific telemetry: how many tool calls per query, how often the model requests elicitation, etc. Finally, always be prepared to iterate: as real users begin to rely on MCP-integrated AI features, gather feedback on performance, cost, and accuracy.

Implementing MCP in production unlocks powerful AI features (e.g. real-time data lookup, automated actions), but it also demands robust architecture. By following best practices in cloud deployments, applying thorough observability and security measures, and using the growing ecosystem of MCP tools and gateways, teams can build scalable, reliable AI-enabled applications. The example code and patterns above show one path from concept to production-ready MCP service. With this foundation, the next steps are to add more tools (e.g. database, search, or API integration servers), implement end-user authentication, and refine multi-agent workflows — always validating each component under load and attack models. This layered, infrastructure-as-code approach ensures your MCP application can handle real-world complexity while keeping user data safe and performance high.

## A message from our Founder
Hey, [Sunil](https://linkedin.com/in/sunilsandhu) here. I wanted to take a moment to thank you for reading until the end and for being a part of this community. Did you know that our team run these publications as a volunteer effort to over 3.5m monthly readers? We don’t receive any funding, we do this to support the community.

If you want to show some love, please take a moment to follow me on [LinkedIn](https://linkedin.com/in/sunilsandhu), [TikTok](https://tiktok.com/@messyfounder), [Instagram](https://instagram.com/sunilsandhu). You can also subscribe to our [weekly newsletter](https://newsletter.plainenglish.io/). And before you go, don’t forget to clap and follow the writer️!

[Mcp Server](https://medium.com/tag/mcp-server?source=post_page-----23ca9c6731ca---------------------------------------)[Mcp Protocol](https://medium.com/tag/mcp-protocol?source=post_page-----23ca9c6731ca---------------------------------------)[Model Context Protocol](https://medium.com/tag/model-context-protocol?source=post_page-----23ca9c6731ca---------------------------------------)[Anthropic Claude](https://medium.com/tag/anthropic-claude?source=post_page-----23ca9c6731ca---------------------------------------)[Agents](https://medium.com/tag/agents?source=post_page-----23ca9c6731ca---------------------------------------)[https://ai.plainenglish.io/?source=post_page---post_publication_info--23ca9c6731ca---------------------------------------](https://ai.plainenglish.io/?source=post_page---post_publication_info--23ca9c6731ca---------------------------------------)[https://ai.plainenglish.io/?source=post_page---post_publication_info--23ca9c6731ca---------------------------------------](https://ai.plainenglish.io/?source=post_page---post_publication_info--23ca9c6731ca---------------------------------------)[## Published in Artificial Intelligence in Plain English](https://ai.plainenglish.io/?source=post_page---post_publication_info--23ca9c6731ca---------------------------------------)[43K followers](/followers?source=post_page---post_publication_info--23ca9c6731ca---------------------------------------)·[Last published 2 hours ago](/how-to-actually-fix-your-gemma-4-local-ai-agent-8fb68ac205da?source=post_page---post_publication_info--23ca9c6731ca---------------------------------------)New AI, ML and Data Science articles every day. Follow to join our 3.5M+ monthly readers.

[https://medium.com/@danushidk507?source=post_page---post_author_info--23ca9c6731ca---------------------------------------](https://medium.com/@danushidk507?source=post_page---post_author_info--23ca9c6731ca---------------------------------------)[https://medium.com/@danushidk507?source=post_page---post_author_info--23ca9c6731ca---------------------------------------](https://medium.com/@danushidk507?source=post_page---post_author_info--23ca9c6731ca---------------------------------------)[## Written by DhanushKumar](https://medium.com/@danushidk507?source=post_page---post_author_info--23ca9c6731ca---------------------------------------)[1.1K followers](https://medium.com/@danushidk507/followers?source=post_page---post_author_info--23ca9c6731ca---------------------------------------)·[68 following](https://medium.com/@danushidk507/following?source=post_page---post_author_info--23ca9c6731ca---------------------------------------)A guy who is curious to learn and blog ... Data Science @Deloitte AI | Data Science | Azure AI

## No responses yet
[https://policy.medium.com/medium-rules-30e5502c4eb4?source=post_page---post_responses--23ca9c6731ca---------------------------------------](https://policy.medium.com/medium-rules-30e5502c4eb4?source=post_page---post_responses--23ca9c6731ca---------------------------------------)[Help](https://help.medium.com/hc/en-us?source=post_page-----23ca9c6731ca---------------------------------------)[Status](https://status.medium.com/?source=post_page-----23ca9c6731ca---------------------------------------)[About](https://medium.com/about?autoplay=1&source=post_page-----23ca9c6731ca---------------------------------------)[Careers](https://medium.com/jobs-at-medium/work-at-medium-959d1a85284e?source=post_page-----23ca9c6731ca---------------------------------------)[Press](mailto:pressinquiries@medium.com)[Blog](https://blog.medium.com/?source=post_page-----23ca9c6731ca---------------------------------------)[Privacy](https://policy.medium.com/medium-privacy-policy-f03bf92035c9?source=post_page-----23ca9c6731ca---------------------------------------)[Rules](https://policy.medium.com/medium-rules-30e5502c4eb4?source=post_page-----23ca9c6731ca---------------------------------------)[Terms](https://policy.medium.com/medium-terms-of-service-9db0094a1e0f?source=post_page-----23ca9c6731ca---------------------------------------)[Text to speech](https://speechify.com/medium?source=post_page-----23ca9c6731ca---------------------------------------)
