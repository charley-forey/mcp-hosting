import { afterEach, describe, expect, it } from "vitest";
import { buildApp } from "../src/server.js";

const previousEnv = { ...process.env };

afterEach(() => {
  process.env = { ...previousEnv };
});

describe("SEP-2243 header validation", () => {
  it("rejects Mcp-Method mismatch", async () => {
    const app = buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/mcp",
      headers: {
        "content-type": "application/json",
        accept: "application/json, text/event-stream",
        "mcp-protocol-version": "2025-06-18",
        "mcp-method": "tools/list",
      },
      payload: {
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: {
          name: "echo",
          arguments: { message: "hello" },
        },
      },
    });

    expect(response.statusCode).toBe(400);
    await app.close();
  });

  it("accepts matching Mcp-Method and Mcp-Name", async () => {
    const app = buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/mcp",
      headers: {
        "content-type": "application/json",
        accept: "application/json, text/event-stream",
        "mcp-protocol-version": "2025-06-18",
        "mcp-method": "tools/call",
        "mcp-name": "echo",
      },
      payload: {
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: {
          name: "echo",
          arguments: { message: "hello" },
        },
      },
    });

    expect(response.statusCode).toBe(200);
    await app.close();
  });
});
