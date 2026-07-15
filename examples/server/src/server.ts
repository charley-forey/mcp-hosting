import Fastify from "fastify";
import { randomUUID } from "node:crypto";
import { setTimeout as sleep } from "node:timers/promises";
import { AuthError, getAuthConfigFromEnv, validateBearerToken } from "./auth.js";
import { handleRpcRequest, resolveMcpName, type JsonRpcRequest } from "./handlers.js";
import { createLogger, createMetrics } from "./observability.js";

const SUPPORTED_PROTOCOL = "2025-06-18";

function parseAllowedOrigins(value: string | undefined): Set<string> | "*" {
  if (!value || value.trim() === "" || value.trim() === "*") return "*";
  const origins = value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
  return new Set(origins);
}

function statusClass(statusCode: number): string {
  return `${Math.floor(statusCode / 100)}xx`;
}

function isJsonRpcRequest(payload: unknown): payload is JsonRpcRequest {
  if (!payload || typeof payload !== "object") return false;
  const rec = payload as Record<string, unknown>;
  return typeof rec.method === "string";
}

function isJsonRpcNotification(payload: JsonRpcRequest): boolean {
  return payload.id === undefined;
}

function isJsonRpcResponse(payload: unknown): boolean {
  if (!payload || typeof payload !== "object") return false;
  const rec = payload as Record<string, unknown>;
  return rec.jsonrpc === "2.0" && ("result" in rec || "error" in rec) && !("method" in rec);
}

export function buildApp() {
  const logger = createLogger();
  const metrics = createMetrics();
  const authConfig = getAuthConfigFromEnv(process.env);
  const endpointPath = process.env.MCP_ENDPOINT_PATH ?? "/mcp";
  const allowedOrigins = parseAllowedOrigins(process.env.MCP_ALLOWED_ORIGINS);

  const app = Fastify({
    logger: false,
    requestIdHeader: "x-request-id",
  });

  app.addHook("onRequest", async (request, reply) => {
    const requestId = request.headers["x-request-id"]?.toString() ?? randomUUID();
    (request as typeof request & { requestId: string }).requestId = requestId;
    reply.header("x-request-id", requestId);
    (request as typeof request & { startAtNs: bigint }).startAtNs = process.hrtime.bigint();
  });

  app.addHook("onResponse", async (request, reply) => {
    const startAtNs = (request as typeof request & { startAtNs?: bigint }).startAtNs ?? process.hrtime.bigint();
    const elapsedSeconds = Number(process.hrtime.bigint() - startAtNs) / 1_000_000_000;
    const route = request.routeOptions.url ?? request.url;
    const labels = {
      method: request.method,
      route,
      status_class: statusClass(reply.statusCode),
    } as const;
    metrics.requestsTotal.inc(labels);
    metrics.requestDurationSeconds.observe(labels, elapsedSeconds);
  });

  app.get("/healthz", async () => ({ status: "ok" }));
  app.get("/readyz", async () => ({ status: "ready" }));
  app.get("/metrics", async (_request, reply) => {
    reply.header("content-type", metrics.registry.contentType);
    return metrics.registry.metrics();
  });

  app.post(endpointPath, async (request, reply) => {
    const origin = request.headers.origin;
    if (allowedOrigins !== "*") {
      if (!origin || !allowedOrigins.has(origin)) {
        return reply.status(403).send({ error: "Origin not allowed" });
      }
    }

    const payload = request.body;
    if (!payload || typeof payload !== "object") {
      return reply.status(400).send({ error: "Request body must be JSON object" });
    }

    if (isJsonRpcResponse(payload)) {
      return reply.status(202).send();
    }

    if (!isJsonRpcRequest(payload)) {
      return reply.status(400).send({
        jsonrpc: "2.0",
        id: null,
        error: { code: -32600, message: "Invalid Request" },
      });
    }

    const rpc = payload;
    const headerMethod = request.headers["mcp-method"];
    const headerName = request.headers["mcp-name"];
    const protocolVersion = request.headers["mcp-protocol-version"];

    if (typeof headerMethod !== "string" || headerMethod !== rpc.method) {
      return reply.status(400).send({ error: "Mcp-Method header mismatch" });
    }

    const expectedName = resolveMcpName(rpc.method, rpc.params);
    if (expectedName !== undefined) {
      if (typeof headerName !== "string" || headerName !== expectedName) {
        return reply.status(400).send({ error: "Mcp-Name header mismatch" });
      }
    }

    if (rpc.method !== "initialize") {
      if (typeof protocolVersion !== "string" || protocolVersion !== SUPPORTED_PROTOCOL) {
        return reply.status(400).send({ error: "Invalid or unsupported MCP-Protocol-Version" });
      }
    }

    if (authConfig && rpc.method !== "initialize") {
      try {
        await validateBearerToken(request.headers.authorization, authConfig);
      } catch (error) {
        const err = error as Error;
        if (err instanceof AuthError) {
          return reply
            .status(err.statusCode)
            .header(
              "WWW-Authenticate",
              `Bearer realm="mcp", error="invalid_token", error_description="${err.message}"`
            )
            .send({ error: err.message });
        }
        logger.error({ err }, "token validation failed");
        return reply.status(401).send({ error: "Unauthorized" });
      }
    }

    if (isJsonRpcNotification(rpc)) {
      return reply.status(202).send();
    }

    const result = handleRpcRequest(rpc, {
      protocolVersion: SUPPORTED_PROTOCOL,
    });

    if (result.kind === "accepted") {
      return reply.status(202).send();
    }

    if (result.kind === "sse") {
      reply.raw.statusCode = 200;
      reply.raw.setHeader("content-type", "text/event-stream");
      reply.raw.setHeader("cache-control", "no-cache");
      reply.raw.setHeader("connection", "keep-alive");
      metrics.activeStreams.inc({ method: rpc.method });

      for (const event of result.events) {
        reply.raw.write(event);
        await sleep(80);
      }
      reply.raw.end();
      return reply.hijack();
    }

    return reply.status(200).header("content-type", "application/json").send(result.body);
  });

  app.get(endpointPath, async (_request, reply) => {
    return reply.status(405).send({ error: "Method Not Allowed" });
  });

  app.delete(endpointPath, async (_request, reply) => {
    return reply.status(405).send({ error: "Method Not Allowed" });
  });

  return app;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const app = buildApp();
  const port = Number(process.env.PORT ?? "8080");
  app
    .listen({ host: "0.0.0.0", port })
    .then(() => {
      app.log.info(`listening on ${port}`);
    })
    .catch((error) => {
      app.log.error(error);
      process.exit(1);
    });
}
