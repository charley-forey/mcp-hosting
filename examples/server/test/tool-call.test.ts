import { afterEach, describe, expect, it } from "vitest";
import { buildApp } from "../src/server.js";

const previousEnv = { ...process.env };

afterEach(() => {
  process.env = { ...previousEnv };
});

describe("tool calls", () => {
  it("returns a JSON response for echo", async () => {
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
          arguments: { message: "hello-world" },
        },
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.result.structuredContent.echoed).toBe("hello-world");
    await app.close();
  });
});
