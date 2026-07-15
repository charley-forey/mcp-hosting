---
slug: prod-mcpcat-streamable
url: https://mcpcat.io/guides/building-streamablehttp-mcp-server/
title: Build StreamableHTTP MCP Servers - Production Guide | MCPcat
author: MCPcat Team
fetched_at: 2026-04-30T20:52:49Z
sha256: 9b0353eaf4bb752c33e3dee10b34f9b8e0970de16b73e336d9e90885c99cb4ec
license: blog-fair-use
tier: 4
---
- Build StreamableHTTP MCP Servers - Production Guide | MCPcat[/guides/](/guides/)
## Building a StreamableHTTP MCP server
Kashish HoraCo-founder of MCPcat[Try out MCPcat](https://mcpcat.io/app)[MCP Dev Quickstart](/guides/topic/mcp-dev-quickstart/)
## The Quick Answer

Create a production-ready MCP server using StreamableHTTP transport with FastMCP for scalable deployments:

```
$pip install fastmcp
```

```
from fastmcp import FastMCP

mcp = FastMCP("weather-server")
mcp.run(transport="streamable-http", host="0.0.0.0", port=8000)
```

StreamableHTTP enables horizontal scaling, load balancing, and cloud deployments unlike stdio's single-process limitation.

## Prerequisites

Python 3.9+ or Node.js 18+

- Basic understanding of HTTP and REST APIs

- Familiarity with JSON-RPC 2.0 protocol

- SSL/TLS certificate for production deployments

## Installation

```
# Python with FastMCP$pip install fastmcp # TypeScript/Node.js$npm install @modelcontextprotocol/sdk # Go implementation$go get github.com/your-org/mcp-streamablehttp
```

## Understanding StreamableHTTP Transport

StreamableHTTP revolutionizes MCP server deployment by replacing local process communication with HTTP-based messaging. This transport protocol consolidates all client-server interactions through a single `/mcp` endpoint, supporting both immediate JSON responses and Server-Sent Events (SSE) for long-running operations.

The protocol operates in two phases: initialization via POST requests and optional streaming via GET with SSE. This dual-phase approach enables three operational modes tailored to different use cases.

## Configuration

StreamableHTTP servers require careful configuration for production environments. Session management, security headers, and connection pooling significantly impact performance and reliability.

```
from fastmcp import FastMCP
import os

mcp = FastMCP(
 "production-server",
 stateless_http=True # Enable stateless mode for horizontal scaling
)

# Configure server with environment variables
config = {
 "host": os.getenv("MCP_HOST", "0.0.0.0"),
 "port": int(os.getenv("MCP_PORT", 8000)),
 "path": "/mcp",
 "session_timeout": 3600, # 1 hour
 "max_connections": 1000
}

mcp.run(transport="streamable-http", **config)
```

For TypeScript implementations, configuration follows a similar pattern with express middleware:

```
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import express from "express";

const app = express();
const server = new Server({
 name: "production-server",
 version: "1.0.0"
});

// Security middleware
app.use((req, res, next) => {
 res.setHeader("X-Content-Type-Options", "nosniff");
 res.setHeader("X-Frame-Options", "DENY");
 next();
});

app.post("/mcp", server.handleRequest);
app.get("/mcp", server.handleSSE);
```

Production deployments must enforce strict CORS policies and validate Origin headers to prevent DNS rebinding attacks. The single-endpoint architecture simplifies firewall rules but requires careful request routing.

## Basic Implementation

Implementing a StreamableHTTP server involves defining tools, resources, and prompts while handling the transport layer automatically. FastMCP abstracts most complexity:

```
from fastmcp import FastMCP
import httpx

mcp = FastMCP("weather-service")

@mcp.tool()
async def get_weather(city: str, units: str = "celsius") -> dict:
 """Fetch current weather for a city"""
 async with httpx.AsyncClient() as client:
 response = await client.get(
 f"https://api.weather.com/v1/current",
 params={"q": city, "units": units}
 )
 return response.json()

@mcp.resource("weather://forecast/{city}")
async def weather_forecast(city: str) -> str:
 """Get 7-day forecast as a resource"""
 # Implementation details...
 return f"7-day forecast for {city}"

if __name__ == "__main__":
 mcp.run(transport="streamable-http", port=8000)
```

The framework handles session management, request routing, and SSE upgrades automatically. Tools execute synchronously by default but support async operations for I/O-bound tasks.

For stateless deployments, enable `stateless_http=True` to store session data externally:

```
mcp = FastMCP("stateless-service", stateless_http=True)

# Sessions stored in Redis or similar
# Each request includes session ID in headers
```

## Advanced Features

StreamableHTTP's architecture enables sophisticated patterns impossible with stdio transport. Load balancing, authentication, and monitoring integrate seamlessly.

### Authentication and Authorization

```
from fastmcp import FastMCP
from functools import wraps
import jwt

mcp = FastMCP("secure-server")

def require_auth(f):
 @wraps(f)
 async def decorated(*args, **kwargs):
 # Extract token from request context
 token = mcp.get_request_context().headers.get("Authorization")
 if not token:
 raise Exception("Authentication required")
 
 try:
 payload = jwt.decode(token, "secret", algorithms=["HS256"])
 # Add user to context
 mcp.set_user_context(payload)
 except jwt.InvalidTokenError:
 raise Exception("Invalid token")
 
 return await f(*args, **kwargs)
 return decorated

@mcp.tool()
@require_auth
async def sensitive_operation(data: str) -> str:
 user = mcp.get_user_context()
 return f"Operation performed by {user['username']}"
```

### Health Checks and Monitoring

Production deployments require comprehensive health monitoring. StreamableHTTP servers should expose health endpoints separate from the MCP protocol:

```
from fastapi import FastAPI
from fastmcp import FastMCP
import psutil

app = FastAPI()
mcp = FastMCP("monitored-server")

@app.get("/health")
async def health_check():
 return {
 "status": "healthy",
 "memory_percent": psutil.virtual_memory().percent,
 "cpu_percent": psutil.cpu_percent(interval=0.1),
 "active_sessions": mcp.get_session_count()
 }

@app.get("/metrics")
async def prometheus_metrics():
 # Return Prometheus-formatted metrics
 return f"""# HELP mcp_requests_total Total MCP requests
# TYPE mcp_requests_total counter
mcp_requests_total {mcp.metrics.total_requests}
"""

# Mount MCP at /mcp
app.mount("/mcp", mcp.asgi())
```

### Connection Pooling and Rate Limiting

High-traffic deployments benefit from connection pooling and rate limiting to prevent resource exhaustion:

```
from fastmcp import FastMCP
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
mcp = FastMCP("rate-limited-server")

# Apply rate limiting to MCP endpoints
@limiter.limit("100/minute")
async def handle_mcp_request(request):
 return await mcp.handle_request(request)

# Connection pool configuration
connection_config = {
 "pool_size": 20,
 "max_overflow": 10,
 "pool_timeout": 30,
 "pool_recycle": 3600
}
```

## Common Issues

### Session Terminated Unexpectedly

StreamableHTTP sessions fail when the `Mcp-Session-Id` header is missing or when keep-alive isn't properly configured. The root cause stems from HTTP's stateless nature conflicting with MCP's stateful protocol expectations.

```
# Fix: Ensure session headers are preserved
headers = {
 "Mcp-Session-Id": session_id,
 "Connection": "keep-alive",
 "Keep-Alive": "timeout=30, max=1000"
}
```

Prevent session loss by implementing session persistence in Redis or similar stores for stateless deployments.

### SSE Connection Timeouts

Long-running operations trigger SSE timeouts when intermediate proxies buffer responses. The HTTP/1.1 specification allows proxies to close idle connections after 60 seconds.

```
# Fix: Send periodic heartbeats
async def sse_handler(request):
 async def event_generator():
 while True:
 # Send heartbeat every 30 seconds
 yield "event: ping\ndata: {}\n\n"
 await asyncio.sleep(30)
 
 return StreamingResponse(
 event_generator(),
 media_type="text/event-stream",
 headers={"X-Accel-Buffering": "no"} # Disable Nginx buffering
 )
```

### CORS and Security Errors

Browser-based MCP clients encounter CORS errors when servers lack proper headers. DNS rebinding attacks exploit permissive CORS policies.

```
// Fix: Implement strict CORS validation
app.use((req, res, next) => {
 const allowedOrigins = ["https://claude.ai", "https://localhost:3000"];
 const origin = req.headers.origin;
 
 if (allowedOrigins.includes(origin)) {
 res.setHeader("Access-Control-Allow-Origin", origin);
 res.setHeader("Access-Control-Allow-Headers", "Content-Type, Mcp-Session-Id");
 res.setHeader("Access-Control-Allow-Methods", "POST, GET, DELETE");
 }
 next();
});
```

## Examples

### Example 1: Multi-Model AI Gateway

This production example demonstrates load balancing across multiple AI providers with automatic failover and response caching.

```
from fastmcp import FastMCP
import httpx
from typing import List, Dict
import asyncio
import redis.asyncio as redis

mcp = FastMCP("ai-gateway", stateless_http=True)
cache = redis.Redis(host="localhost")

@mcp.tool()
async def query_models(
 prompt: str,
 models: List[str] = ["gpt-4", "claude-3", "llama-3"],
 strategy: str = "first_available" # or "consensus", "fastest"
) -> Dict[str, any]:
 """Query multiple AI models with fallback and caching"""
 
 # Check cache first
 cache_key = f"query:{hash(prompt + ''.join(models))}"
 cached = await cache.get(cache_key)
 if cached:
 return json.loads(cached)
 
 async def query_model(model: str):
 endpoints = {
 "gpt-4": "https://api.openai.com/v1/completions",
 "claude-3": "https://api.anthropic.com/v1/complete",
 "llama-3": "https://api.together.xyz/inference"
 }
 
 async with httpx.AsyncClient(timeout=30) as client:
 try:
 response = await client.post(
 endpoints[model],
 json={"prompt": prompt, "model": model},
 headers={"Authorization": f"Bearer {os.getenv(f'{model}_KEY')}"}
 )
 return {"model": model, "response": response.json(), "latency": response.elapsed}
 except Exception as e:
 return {"model": model, "error": str(e)}
 
 if strategy == "first_available":
 for model in models:
 result = await query_model(model)
 if "error" not in result:
 await cache.setex(cache_key, 3600, json.dumps(result))
 return result
 
 elif strategy == "consensus":
 results = await asyncio.gather(*[query_model(m) for m in models])
 # Return majority response
 valid_results = [r for r in results if "error" not in r]
 if valid_results:
 await cache.setex(cache_key, 3600, json.dumps(valid_results))
 return {"consensus": valid_results, "strategy": "majority"}
 
 return {"error": "All models failed"}
```

This gateway pattern enables cost optimization by routing queries to the most appropriate model based on complexity, availability, and pricing. Production deployments add circuit breakers, detailed metrics, and response validation.

### Example 2: Distributed Task Processing

StreamableHTTP enables distributed MCP servers that coordinate across multiple workers for compute-intensive operations.

```
from fastmcp import FastMCP
from celery import Celery
import asyncio
from typing import Optional

mcp = FastMCP("task-processor", stateless_http=True)
celery_app = Celery("tasks", broker="redis://localhost:6379")

@celery_app.task
def process_heavy_computation(data: dict) -> dict:
 # CPU-intensive work
 import numpy as np
 matrix = np.random.rand(1000, 1000)
 result = np.linalg.svd(matrix)
 return {"singular_values": result[1].tolist()[:10]}

@mcp.tool()
async def distributed_compute(
 task_type: str,
 data: dict,
 timeout: Optional[int] = 300
) -> dict:
 """Submit computation to distributed workers"""
 
 if task_type == "matrix_decomposition":
 task = process_heavy_computation.delay(data)
 
 # Return immediately with task ID for polling
 if timeout == 0:
 return {
 "status": "submitted",
 "task_id": task.id,
 "poll_endpoint": f"/mcp/tasks/{task.id}"
 }
 
 # Wait for completion with SSE updates
 start_time = asyncio.get_event_loop().time()
 while (asyncio.get_event_loop().time() - start_time) timeout:
 if task.ready():
 return {
 "status": "completed",
 "result": task.result,
 "duration": asyncio.get_event_loop().time() - start_time
 }
 
 # Send SSE update
 await mcp.send_sse_event({
 "event": "progress",
 "data": {"task_id": task.id, "state": task.state}
 })
 await asyncio.sleep(1)
 
 return {"status": "timeout", "task_id": task.id}
 
 return {"error": f"Unknown task type: {task_type}"}

@mcp.resource("task://status/{task_id}")
async def get_task_status(task_id: str) -> dict:
 """Check distributed task status"""
 task = celery_app.AsyncResult(task_id)
 return {
 "id": task_id,
 "state": task.state,
 "result": task.result if task.ready() else None
 }
```

This architecture scales horizontally by adding Celery workers. The MCP server remains lightweight, delegating heavy computation while maintaining responsive client interactions through SSE progress updates.

### Example 3: Edge Deployment with Cloudflare Workers

StreamableHTTP's stateless mode enables edge deployments where traditional stdio servers cannot run.

```
import { Hono } from 'hono';
import { MCP } from '@modelcontextprotocol/sdk';

const app = new Hono();
const mcp = new MCP({
 name: "edge-server",
 stateless: true
});

// Geolocation-aware tool
mcp.addTool({
 name: "get_nearby_data",
 description: "Fetch data relevant to user's location",
 parameters: {
 type: "object",
 properties: {
 query: { type: "string" },
 radius: { type: "number", default: 10 }
 }
 },
 handler: async (params, context) => {
 // Access Cloudflare's geolocation data
 const cf = context.request.cf;
 const location = {
 country: cf.country,
 city: cf.city,
 latitude: cf.latitude,
 longitude: cf.longitude
 };
 
 // Query nearby data from R2 or D1
 const results = await queryNearbyData(
 location,
 params.query,
 params.radius
 );
 
 return {
 location,
 results,
 cached: context.request.headers.get("CF-Cache-Status") === "HIT"
 };
 }
});

app.post('/mcp', async (c) => {
 const response = await mcp.handleRequest(c.req);
 return c.json(response);
});

app.get('/mcp', async (c) => {
 // SSE not supported in Workers, return error
 return c.json({
 error: "SSE not supported on edge",
 alternative: "Use polling with POST requests"
 }, 501);
});

export default app;
```

Edge deployments trade SSE support for global distribution and zero cold starts. This pattern suits read-heavy workloads where low latency matters more than real-time updates.

#### Related Guides
[## Setting up StreamableHTTP for scalable deployments
Deploy scalable MCP servers with StreamableHTTP for high performance and horizontal scaling.](/guides/setting-up-streamablehttp-scalable-deployments/)[## Comparing stdio vs. SSE vs. StreamableHTTP
Compare MCP transport protocols to choose between stdio, SSE, and StreamableHTTP for your use case.](/guides/comparing-stdio-sse-streamablehttp/)[## Configuring MCP installations for production deployments
Configure MCP servers for production with security, monitoring, and deployment best practices.](/guides/configuring-mcp-installations-production/)
#### Keep an eye on AI.
Get rich user analytics and tracing on every user interacting with your MCP server.[Get started](https://mcpcat.io/app)
