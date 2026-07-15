import http from "k6/http";
import { check, sleep } from "k6";
import { Counter } from "k6/metrics";

const BASE_URL = __ENV.BASE_URL || "http://localhost:18080";
const MCP_URL = `${BASE_URL}/mcp`;

const streamStallFailures = new Counter("stream_stall_failures");

export const options = {
  scenarios: {
    init_burst: {
      executor: "per-vu-iterations",
      vus: 50,
      iterations: 1,
      exec: "initBurst",
      maxDuration: "30s",
    },
    tool_call_steady: {
      executor: "constant-vus",
      vus: 20,
      duration: "60s",
      exec: "toolCallSteady",
      startTime: "2s",
    },
    sse_streams: {
      executor: "constant-vus",
      vus: 5,
      duration: "30s",
      exec: "sseStreams",
      startTime: "5s",
    },
  },
  thresholds: {
    "http_req_duration{scenario:tool_call_steady}": ["p(99)<300"],
    http_req_failed: ["rate<0.01"],
    stream_stall_failures: ["count==0"],
  },
};

function baseHeaders(method, name) {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
    "MCP-Protocol-Version": "2025-06-18",
    "Mcp-Method": method,
  };
  if (name) {
    headers["Mcp-Name"] = name;
  }
  if (__ENV.AUTH_BEARER) {
    headers.Authorization = `Bearer ${__ENV.AUTH_BEARER}`;
  }
  return headers;
}

function requestBody(method, id, params = {}) {
  return JSON.stringify({
    jsonrpc: "2.0",
    id,
    method,
    params,
  });
}

export function initBurst() {
  const res = http.post(
    MCP_URL,
    requestBody("initialize", __VU, {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "k6", version: "0.0.0" },
    }),
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
        "Mcp-Method": "initialize",
      },
      tags: { scenario: "init_burst" },
    }
  );

  check(res, {
    "initialize returns 200": (r) => r.status === 200,
    "initialize has result": (r) => {
      try {
        return JSON.parse(r.body).result.protocolVersion === "2025-06-18";
      } catch (_) {
        return false;
      }
    },
  });
}

export function toolCallSteady() {
  const res = http.post(
    MCP_URL,
    requestBody("tools/call", `${__VU}-${__ITER}`, {
      name: "echo",
      arguments: { message: `hello-from-vu-${__VU}` },
    }),
    {
      headers: baseHeaders("tools/call", "echo"),
      tags: { scenario: "tool_call_steady" },
    }
  );

  check(res, {
    "tool call returns 200": (r) => r.status === 200,
    "echo payload returned": (r) => r.body.includes("hello-from-vu-"),
  });
  sleep(1);
}

export function sseStreams() {
  const started = Date.now();
  const res = http.post(
    MCP_URL,
    requestBody("tools/call", `${__VU}-${__ITER}`, {
      name: "stream_echo",
      arguments: { message: `stream-${__VU}` },
    }),
    {
      headers: baseHeaders("tools/call", "stream_echo"),
      tags: { scenario: "sse_streams" },
      timeout: "10s",
    }
  );

  const ok = check(res, {
    "sse returns 200": (r) => r.status === 200,
    "sse content type": (r) => (r.headers["Content-Type"] || "").includes("text/event-stream"),
    "sse contains progress event": (r) => r.body.includes("notifications/progress"),
    "sse contains final result": (r) => r.body.includes('"streamed":true'),
  });

  // If streaming took too long end-to-end, count it as a stream stall failure.
  const elapsedMs = Date.now() - started;
  if (!ok || elapsedMs > 5000) {
    streamStallFailures.add(1);
  }
  sleep(1);
}
