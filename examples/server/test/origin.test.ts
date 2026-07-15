import { afterEach, describe, expect, it } from "vitest";
import { buildApp } from "../src/server.js";

const previousEnv = { ...process.env };

afterEach(() => {
  process.env = { ...previousEnv };
});

describe("origin validation", () => {
  it("blocks non-allowlisted origins", async () => {
    process.env.MCP_ALLOWED_ORIGINS = "https://allowed.example.com";
    const app = buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/mcp",
      headers: {
        "content-type": "application/json",
        accept: "application/json, text/event-stream",
        origin: "https://evil.example.com",
        "mcp-method": "initialize",
      },
      payload: {
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "test", version: "0" } },
      },
    });

    expect(response.statusCode).toBe(403);
    await app.close();
  });

  it("allows allowlisted origins", async () => {
    process.env.MCP_ALLOWED_ORIGINS = "https://allowed.example.com";
    const app = buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/mcp",
      headers: {
        "content-type": "application/json",
        accept: "application/json, text/event-stream",
        origin: "https://allowed.example.com",
        "mcp-method": "initialize",
      },
      payload: {
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "test", version: "0" } },
      },
    });

    expect(response.statusCode).toBe(200);
    await app.close();
  });
});
