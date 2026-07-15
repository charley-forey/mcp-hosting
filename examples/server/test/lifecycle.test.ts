import { afterEach, describe, expect, it } from "vitest";
import { buildApp } from "../src/server.js";

const previousEnv = { ...process.env };

afterEach(() => {
  process.env = { ...previousEnv };
});

describe("lifecycle", () => {
  it("returns initialize result", async () => {
    const app = buildApp();
    const response = await app.inject({
      method: "POST",
      url: "/mcp",
      headers: {
        "content-type": "application/json",
        accept: "application/json, text/event-stream",
        "mcp-method": "initialize",
      },
      payload: {
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2025-06-18",
          capabilities: {},
          clientInfo: { name: "test", version: "0.0.0" },
        },
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.result.protocolVersion).toBe("2025-06-18");
    expect(body.result.capabilities).toBeDefined();
    await app.close();
  });

  it("enforces MCP-Protocol-Version on non-initialize calls", async () => {
    const app = buildApp();
    const response = await app.inject({
      method: "POST",
      url: "/mcp",
      headers: {
        "content-type": "application/json",
        accept: "application/json, text/event-stream",
        "mcp-method": "tools/list",
      },
      payload: {
        jsonrpc: "2.0",
        id: 1,
        method: "tools/list",
        params: {},
      },
    });

    expect(response.statusCode).toBe(400);
    await app.close();
  });
});
