---
slug: prod-fordel-mcp
url: https://fordelstudios.com/research/building-production-mcp-servers
title: Building Production MCP Servers: What No Tutorial Tells You | Fordel Studios
author: 
fetched_at: 2026-04-30T20:53:05Z
sha256: f38ac584402c525779d2806af882d2ccfef6a060c8b2adfb1939c16d88ca5d4d
license: blog-fair-use
tier: 4
---
Building Production MCP Servers: What No Tutorial Tells You | Fordel Studios**Skip to main content[Start a Conversation](/contact)
# Building Production MCP Servers: What No Tutorial Tells You
MCP has 97M+ monthly SDK downloads and 5,800+ listed servers. Most of them will not survive contact with real production traffic. This is what tutorials skip: transport selection, OAuth 2.1, session state, rate limiting, and the horizontal scaling problem that everyone hits at the same time.

[Abhishek Sharma](/about)· Head of Engg @ Fordel StudiosMarch 20, 202612 min readEvery engineer building with AI agents right now is also, knowingly or not, building against MCP — the [Model Context Protocol](https://modelcontextprotocol.io). Anthropic published the specification in late 2024 and within a year it became the de facto standard for how AI models connect to external tools, databases, and business systems. OpenAI, Google, and Microsoft all backed it. Claude Desktop, Cursor, Windsurf, and dozens of other clients ship MCP support by default.

The numbers reflect it: as of early 2026, the MCP ecosystem has over 97 million monthly SDK downloads, 5,800+ listed servers on the PulseMCP registry, and remote server deployments are up roughly 4x since May 2025. MCP is not experimental. It is infrastructure.

The problem is that most of the tutorials showing you how to build an MCP server stop at hello world. They show you how to define a tool, register it, and get Claude to call it. What they do not show you is what happens when that server handles fifty concurrent agents, one of which is stuck in a retry loop, another of which is authenticating through an enterprise SSO, and a third of which has a session that just got routed to a different instance by your load balancer.

That is the gap this article closes.

97M+Monthly MCP SDK downloads as of early 2026Source: MCP Adoption Statistics, MCP Manager, 20265,800+MCP servers listed on the PulseMCP registryRemote MCP servers are up ~4x since May 202540%Of enterprise applications predicted to include task-specific AI agents by end of 2026Gartner, 2026 — up from under 5% in 2024
## The Protocol Itself
MCP is [JSON-RPC](https://www.jsonrpc.org/specification) 2.0 over a transport layer. That is the entire protocol. The spec defines a handful of message types — initialize, tools/list, tools/call, resources/read, prompts/get — and a capability negotiation handshake at the start of every session. The model asks what tools are available; the server lists them with JSON Schema definitions; the model calls them as needed.

The simplicity is deliberate. MCP is not trying to be a workflow engine, an orchestration platform, or a data pipeline. It is a vocabulary for agent-to-service communication. The richness comes from the ecosystem of clients and servers that implement it, not from the protocol itself.

Where the complexity lives is in the transport choices, the session model, and everything that comes after basic tool registration. That is where production deployments diverge from demo code.

“MCP is JSON-RPC 2.0 over a transport. The protocol is simple. The engineering around it is not.”
## Transport: Stop Building SSE Servers
The original MCP specification used two transport options: stdio (for local in-process communication) and HTTP with Server-Sent Events (SSE) for remote servers. SSE made sense as an early choice — it is simple, widely supported, and allows the server to push messages to the client over a persistent connection.

As of the MCP specification version 2025-03-26, SSE transport is deprecated. The replacement is Streamable HTTP.

The distinction matters for two reasons. First, SSE persistent connections fight with every reverse proxy, load balancer, and API gateway in existence. Nginx, AWS ALB, and [Cloudflare](https://developers.cloudflare.com/workers/) all have opinions about how long a connection can stay open. Managing those timeouts, reconnections, and mid-session state preservation adds operational complexity that is entirely avoidable.

Second, SSE has a fundamental security problem with long-lived connections. The initial check authenticates the session, but the persistent connection keeps a door propped open afterward. Streamable HTTP resolves this by using standard HTTP/HTTPS for all communication, with optional SSE streaming only when the server needs to push multiple messages within a single request cycle.

PropertySTDIOHTTP + SSE (deprecated)Streamable HTTP (current)Best forLocal dev, desktop appsEarly remote serversProduction remote serversHorizontal scalingN/A (single process)Difficult — sticky sessions requiredNative, stateless-friendlyLoad balancer compatibilityN/APoor — persistent connectionsExcellent — standard HTTPSecurity surfaceLow (local process)Session-wide exposure after authPer-request origin validationDiscoveryNot applicableRequires live connection.well-known metadata supportIf you are building a new MCP server today for remote deployment, use Streamable HTTP. The server exposes a single endpoint that accepts POST requests for all MCP messages. GET on the same endpoint opens an SSE stream only when the server needs to push notifications. The client gets standard HTTP semantics; you get standard HTTP infrastructure.

## Authentication: OAuth 2.1 Is Not Optional
Most tutorial MCP servers have no authentication. They assume the server is local, or they protect it with a static API key passed in an environment variable. Neither pattern survives production.

The MCP specification mandates [OAuth 2.1](https://oauth.net/2.1/) for remote server authentication. The requirements are specific:

All clients must use PKCE with SHA-256 code challenges — no exceptions, even for confidential clients. Authorization endpoints must be served over HTTPS. Clients must expose a /.well-known/oauth-protected-resource endpoint so that MCP clients can discover your authorization requirements without a live connection. Your server must implement [OAuth 2.0](https://oauth.net/2/) Authorization Server Metadata (RFC 8414).

Token management is where most implementations get it wrong. The naive approach validates the token on every request by making an external call to your authorization server. At any real traffic volume, this becomes a bottleneck. The production pattern is to cache the JSON Web Key Set (JWKS) from your authorization server and validate tokens locally. This eliminates the external HTTP round-trip on every request and drops token validation latency from 50-200ms to under 1ms.

For organizations already running an identity provider — Auth0, Okta, Azure AD, Keycloak — the practical path is to configure your IdP as the OAuth 2.1 authorization server and implement the .well-known metadata endpoint on your MCP server side to point clients at it. This gives you SSO, short-lived tokens, and audit logs without building an auth system from scratch.

One pattern from production deployments at Microsoft: use least-privilege scopes per tool rather than a single server-wide scope. An MCP server that reads Salesforce records and also sends Slack messages should require different OAuth scopes for those two capabilities. An agent that only needs to read data should not get a token that can write it.

“An agent that can only read should not hold a token that can write. Scope your MCP tools the same way you scope API keys — by operation, not by server.”
## Session State: The Load Balancer Problem
Here is the concrete failure mode that will affect every MCP server that gets past a single instance: stateful sessions fight load balancers.

The MCP session model works like this: the client sends an initialize request, the server responds with an Mcp-Session-Id header containing a unique session identifier, and subsequent requests include that ID so the server can retrieve session state. Simple in concept. Problematic at scale.

A standard round-robin load balancer routes requests to any available instance. If your server stores session state in memory — which is what most tutorial implementations do — then request two of a session that started on instance A might land on instance B, which has no knowledge of that session. The agent gets an error. The agent retries. The retry might land on A or B at random. The failure mode is intermittent and hard to reproduce in testing.

There are two clean solutions and one expensive one. The two clean solutions: store session state in a shared external store ([Redis](https://redis.io) is the standard choice here) so any instance can retrieve it, or design your server to be stateless — push all session context into the signed session token rather than server-side storage, so there is nothing to look up.

The 2026 MCP roadmap explicitly calls out horizontal scaling as a priority fix. The spec is evolving to add clearer semantics for how servers signal that they support stateless operation and how clients should handle session routing. Until that lands, you are engineering around it.

The expensive non-solution — sticky sessions at the load balancer — gives you the illusion of solving the problem while creating a harder one: hot instances, uneven load distribution, and single points of failure for individual user sessions. Do not use sticky sessions unless you have no other option.

ApproachSession StorageHorizontal ScaleFailure ModeIn-memory (naive)Instance localNoRandom errors on non-origin instanceRedis session storeShared externalYesRedis becomes single point of failureSigned token (stateless)Client-held JWTYesToken size grows with session dataSticky sessions (LB)Instance localPartialHot instances, session loss on crash
## Rate Limiting: Agents Are Not Humans
Rate limiting for human API consumers is a solved problem. You pick a token bucket or sliding window algorithm, set a reasonable limit per API key, and deploy it. Most humans will never hit it.

Agents are not humans. An agent stuck in a retry loop can generate over a thousand tool calls per minute. An agent that miscalculates its task progress might call your search tool forty times in rapid succession before its context window forces it to reconsider. When you have fifty agents connected to one MCP server, the aggregate call rate is nothing like what any traffic model built on human behavior would predict.

The failure mode is compounding. Agent A hits a transient error on your server. It retries immediately. The retry causes additional load. More agents see elevated error rates. They retry. Your server is now under ten times its steady-state load, generated entirely by retry storms from a single transient failure.

The engineering pattern here is borrowed from distributed systems: exponential backoff with jitter at the client, combined with circuit breakers at the server. The circuit breaker opens when error rates cross a threshold, returning 429 or 503 with a Retry-After header instead of queuing requests that will likely fail anyway. This gives the underlying service time to recover and signals to agents that they should pause rather than pile on.

One practical configuration: implement rate limits at two granularities. Per-session limits handle individual agent runaway. Per-IP or per-API-key limits handle coordinated load from agent orchestration platforms. A CrewAI or LangChain orchestrator running ten agents will all share an API key — your per-session rate limit will not catch that pattern; your per-key limit will.

## Discoverability: The .well-known Problem
One of the explicit gaps on the MCP 2026 roadmap is discoverability: there is currently no standard way for a registry, crawler, or client to learn what an MCP server does without making a live connection to it. You can browse PulseMCP and find 5,800 servers, but to know what tools any of them expose, you have to connect and send a tools/list request.

The roadmap solution is a .well-known metadata endpoint analogous to the well-known patterns already established for OAuth (/.well-known/openid-configuration) and web applications (/.well-known/security.txt). An MCP server that exposes /.well-known/mcp-server.json — or whatever the final spec lands on — can describe its tools, capabilities, auth requirements, and supported transport without requiring an active session.

This matters for practical reasons beyond registries. It matters for enterprise IT governance: a security team that wants to audit which MCP servers are accessible in their environment needs to be able to query what those servers expose. It matters for API gateways that want to route requests without establishing sessions. It matters for multi-agent systems where a routing agent needs to know which downstream MCP server handles a given class of task.

The engineering recommendation for servers built today: implement a GET / endpoint that returns a lightweight capability summary, even if it does not yet conform to a spec. Something machine-readable that describes your tools, your auth requirements, and your supported transport. When the official .well-known format lands, migrating to it from a hand-rolled capability endpoint is straightforward.

## Observability: What You Cannot See, You Cannot Fix
Standard web application [observability](/research/ai-agent-observability-running-blind-production) — request/response timing, error rates, status codes — is necessary but not sufficient for MCP servers. The unit of work is not a request; it is a tool call within a session. The latency you care about is not HTTP response time; it is the time from agent question to agent answer, which may span multiple tool calls across multiple sessions.

Effective MCP server [observability](/research/ai-agent-observability-running-blind-production) has three layers. First, standard HTTP metrics: latency per endpoint, error rates, request volume. These tell you if the server is healthy. Second, MCP-level tracing: which tools are called, how often, with what argument patterns, and with what success rates. This tells you how agents are actually using your server, which is often different from how you expected. Third, session-level correlation: grouping tool calls by session ID to trace the full arc of an agent task. This is what enables debugging when an agent reports a failure — you can reconstruct exactly what it tried.

[OpenTelemetry](https://opentelemetry.io) is the right instrumentation layer. The MCP Python and TypeScript SDKs both have hooks for adding spans around tool execution. Exporting those spans to Jaeger, Honeycomb, or Datadog gives you the distributed trace view. The session ID should propagate as a trace context attribute so you can filter all spans for a given agent session.

## The Gateway Pattern
At sufficient scale, direct client-to-server MCP connections create management problems that are familiar from the API gateway era: authentication is repeated at every server, [rate limiting](/research/rate-limiting-patterns-that-scale) is implemented inconsistently, observability is fragmented, and adding or removing servers requires reconfiguring every client.

The MCP gateway pattern addresses this by inserting a single ingress point between MCP clients and the pool of MCP servers. Clients authenticate to the gateway. The gateway handles session routing, [rate limiting](/research/rate-limiting-patterns-that-scale), and observability. Individual MCP servers become internal services that implement the protocol without worrying about the operational concerns.

Emerging products in this space include Cloudflare's Agent infrastructure (which runs MCP servers at the edge on Workers), [Composio](https://docs.composio.dev) (which provides a managed MCP gateway with 250+ pre-built server integrations), and Zuplo (which adds API management capabilities to MCP deployments). For teams building internal tooling, a self-hosted gateway built on Kong or Nginx with MCP-aware plugins is also viable.

The gateway pattern is not always the right answer. For simple use cases with a single MCP server and a known set of clients, the overhead of a gateway adds complexity without proportional value. The inflection point is usually around five or more MCP servers, or when your client set includes external parties whose authentication you do not fully control.

“Direct MCP connections work fine at the first server. By the fifth, you are reinventing the API gateway. Build the gateway first.”Fordel Studios
## What This Means If You Are Building Now
MCP is the right standard to build on. The protocol is stable enough, the tooling is mature enough, and the client ecosystem is broad enough that building proprietary agent-to-service integration protocols instead is a poor tradeoff. The question is not whether to use MCP — it is how to build MCP servers that hold up.

The practical checklist for a production MCP server in 2026: use Streamable HTTP transport, not SSE. Implement OAuth 2.1 with PKCE, JWKS caching, and the /.well-known/oauth-protected-resource endpoint. Store session state in a shared external store or design it out of your architecture entirely. Implement exponential backoff semantics in your error responses with circuit breakers for downstream dependencies. Add per-tool observability with OpenTelemetry. Consider a gateway if you are running more than a handful of servers.

None of this is exotic. These are the same patterns you would apply to any production API. MCP does not introduce new engineering problems — it surfaces the existing ones more quickly because agents hammer APIs in ways that human users never do. The retry storm that might happen once a month with a human API consumer happens before lunch on day one with a poorly behaved agent.

The teams getting ahead of this are building their MCP servers the way they would build payment processing infrastructure: with the assumption that something will fail, something will retry aggressively, and something will try to authenticate from an unexpected context. That posture — conservative, defensive, observable — is what separates an MCP server that survives production from one that becomes a cautionary tale.

### Frequently Asked Questions
What do tutorials leave out about building production MCP servers?**

Tutorials show happy-path tool registration and invocation. They omit: authentication per tool call, graceful degradation when tools fail, schema versioning strategy, rate limiting, multi-tenant session isolation, audit logging, and the operational overhead of keeping tool manifests synchronized with implementation. Most tutorial-derived MCP servers are not safe to expose to production traffic.

**How do you structure MCP tool schemas for production reliability?**

Production MCP tool schemas need: strict input validation with JSON Schema (required fields, type constraints, enum values), descriptive error messages for validation failures, schema versioning in the tool name or metadata, and backward-compatible schema evolution policy. Schema drift between the manifest and implementation is the most common source of LLM hallucinating invalid tool calls.

**What is the right approach to MCP server authentication?**

MCP has no standard auth built into the protocol. Implement auth as middleware in your tool handlers: validate a scoped API key or JWT on every tool call, reject calls with expired or insufficient-scope tokens, and log auth failures separately from tool execution failures. Never rely on network-level isolation alone as the authentication boundary.

**How do you test MCP servers before production deployment?**

MCP server testing requires: unit tests for each tool handler with mocked external dependencies, integration tests using a real MCP client (use the MCP inspector or Claude Desktop in test mode), schema validation tests to catch drift between manifest and implementation, and chaos tests that simulate tool failures to verify error responses are LLM-parseable.

**How does MCP server design change for high-concurrency production workloads?**

High-concurrency MCP requires: stateless tool handlers with no in-process state (use Redis or a database for shared state), connection pooling for downstream API calls, per-tool concurrency limits to prevent one tool from starving others, and horizontal scaling behind a load balancer. Stateful stdio-based MCP servers cannot scale horizontally and are inappropriate for high-concurrency use.

Build with usNeed this kind of thinking applied to your product?

We build AI agents, full-stack platforms, and engineering systems. Same depth, applied to your problem.

[Start a conversation](/contact)[View services](/services)NewsletterEnjoyed this? Get the weekly digest.

Research highlights and AI news, delivered every Thursday. No spam.

Share[LinkedIn](https://www.linkedin.com/sharing/share-offsite/?url=https://fordelstudios.com/research/building-production-mcp-servers)[X](https://x.com/intent/tweet?url=https://fordelstudios.com/research/building-production-mcp-servers&text=Building%20Production%20MCP%20Servers%3A%20What%20No%20Tutorial%20Tells%20You)Loading comments...Keep Reading
## Related articles
[AI & Engineering
### MCP in Production: The Engineering Reality
13 min read](/research/mcp-production-engineering-guide)[Industry
### Top AI Agent Development Companies in India 2026: An Honest Evaluation
14 min read](/research/top-ai-agent-development-companies-india-2026)[AI & Engineering
### MCP vs CLI: Why Anthropic Over-Engineered a Solved Problem
12 min read](/research/mcp-vs-cli-over-engineered)[Engineering
### How to Add Idempotency Keys to Your API Without Breaking Existing Clients
12 min read](/research/how-to-add-idempotency-keys-to-your-api-without-breaking-existing-clients)[AI News
### Google Just Fixed AI Coding Agents' Biggest Problem — Here's What It Actually Means
4 min read](/research/google-gemini-agent-skills-mcp-stale-code)[All articles](/research)[https://wa.me/918296940842](https://wa.me/918296940842)
