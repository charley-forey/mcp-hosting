# 01. Overview

> **Spec version**: this chapter is written against MCP protocol version `2025-06-18` and SEP-2243 (Final, 2026-02-04). [src: spec-transports, spec-sep-2243]

## What is MCP?

The **Model Context Protocol (MCP)** is an open protocol that standardizes how AI applications (clients) connect to data sources, tools, and prompts (servers). At the wire level, MCP is JSON-RPC 2.0; at the application level, it defines a small set of capabilities (tools, resources, prompts, roots, sampling, elicitation) that a server can offer to a client. [src: spec-transports, spec-architecture]

MCP defines two **standard transport mechanisms**:

- **stdio** - the client launches the MCP server as a subprocess and exchanges newline-delimited JSON-RPC messages over `stdin`/`stdout`. Intended for local, single-tenant use. [src: spec-transports]
- **Streamable HTTP** - the server runs as an independent HTTP service exposing a single MCP endpoint (commonly `/mcp`) that handles both POST and GET. Intended for remote, multi-client deployments. [src: spec-transports]

Streamable HTTP **replaces** the older HTTP+SSE transport from protocol version `2024-11-05`. Backwards compatibility is possible but discouraged for new deployments. [src: spec-transports, spec-rfc-206-streamable-http]

## Why streamable HTTP for hosted deployments

The streamable HTTP transport was designed to work with mainstream HTTP infrastructure rather than against it: [src: spec-rfc-206-streamable-http]

- It uses standard HTTP POST/GET semantics, so any reverse proxy, ingress controller, WAF, CDN, or service mesh can carry the traffic without protocol-aware logic.
- The server can choose, **per-request**, whether to return an immediate JSON response (`Content-Type: application/json`) or upgrade to Server-Sent Events (`Content-Type: text/event-stream`) for streaming. This means most short tool calls remain cheap one-shot HTTP requests, with SSE used only when streaming is actually needed. [src: spec-transports]
- The transport explicitly supports **stateless servers**: session affinity, resumability, and state are all opt-in features, not preconditions for hosting. [src: spec-transports, spec-rfc-206-streamable-http]
- SEP-2243 standardizes two routing headers (`Mcp-Method`, `Mcp-Name`) so that load balancers, gateways, and observability tools can route and meter MCP traffic without deep packet inspection. [src: spec-sep-2243]

The combined effect: a streamable HTTP MCP server is, from an ops perspective, a normal HTTP microservice. That is the property we exploit when we put it on Kubernetes.

## When to host vs consume

| Decision | Choose this when |
|---|---|
| **Consume an existing remote MCP** | The capability you need is already published in the MCP registry or by a vendor (GitHub, Slack, Postgres connectors, etc.). [src: spec-registry-remote] |
| **Run an MCP locally over stdio** | The MCP wraps a single user's local tooling (IDE plugins, local file system access). Single-tenant, single machine, no networking. [src: spec-transports] |
| **Host your own streamable HTTP MCP** | You're exposing internal data, tools, or business logic to AI clients across multiple users, machines, or teams; you need centralized auth, audit logs, rate limiting, or rolling deploys. [src: spec-transports, sdk-openai-agents-mcp] |

This handbook is about the third row.

## Reading map

```mermaid
flowchart LR
  Start[You are here] --> Overview[01 Overview]
  Overview --> Transport[02 Transport architecture]
  Transport --> Hosting[03 Hosting options]
  Hosting --> K8s[04 Kubernetes deep dive]
  K8s --> Sessions[05 Sessions and state]
  Sessions --> Security[06 Security]
  Security --> Obs[07 Observability]
  Obs --> Checklist[08 Deployment checklist]
  Checklist --> Runbook[09 Internal runbook]
  Runbook --> Refs[10 References]
```

If you only have time for one chapter, read [04 Kubernetes deep dive](04-kubernetes-deep-dive.md). If you only have time for one paragraph, read the next one.

## TL;DR for the impatient

Run your MCP as a stateless HTTP service on Kubernetes behind an ingress that supports SSE pass-through. Expose a single `/mcp` endpoint that accepts POST (and optionally GET) requests; let the server decide per-request whether to reply with JSON or upgrade to SSE. Validate the `Origin` header on every request, require OAuth 2.1 for non-public servers, terminate TLS at the ingress, and emit structured logs and OpenTelemetry traces. Scale horizontally on CPU and request rate; if your server needs sessions, prefer JWT-encoded session IDs over server-side state. Everything else in this handbook is detail. [src: spec-transports, spec-sep-2243, spec-authorization, sdk-openai-agents-mcp]
