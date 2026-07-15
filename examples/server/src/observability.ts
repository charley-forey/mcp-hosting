import pino from "pino";
import { Counter, Histogram, Registry, collectDefaultMetrics } from "prom-client";

export interface MetricsBundle {
  registry: Registry;
  requestsTotal: Counter<"method" | "route" | "status_class">;
  requestDurationSeconds: Histogram<"method" | "route" | "status_class">;
  activeStreams: Counter<"method">;
}

export function createLogger() {
  return pino({
    level: process.env.LOG_LEVEL ?? "info",
    base: {
      service: "mcp-hosting-reference-server",
      version: "0.1.0",
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  });
}

export function createMetrics(): MetricsBundle {
  const registry = new Registry();
  collectDefaultMetrics({ register: registry });

  const requestsTotal = new Counter({
    name: "mcp_requests_total",
    help: "Total MCP HTTP requests.",
    labelNames: ["method", "route", "status_class"] as const,
    registers: [registry],
  });

  const requestDurationSeconds = new Histogram({
    name: "mcp_request_duration_seconds",
    help: "MCP HTTP request duration in seconds.",
    labelNames: ["method", "route", "status_class"] as const,
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.3, 0.5, 1, 2, 5, 10],
    registers: [registry],
  });

  const activeStreams = new Counter({
    name: "mcp_streams_total",
    help: "Total number of SSE streams served.",
    labelNames: ["method"] as const,
    registers: [registry],
  });

  return {
    registry,
    requestsTotal,
    requestDurationSeconds,
    activeStreams,
  };
}
