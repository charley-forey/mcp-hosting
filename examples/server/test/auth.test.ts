import Fastify from "fastify";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { exportJWK, generateKeyPair, SignJWT } from "jose";
import { buildApp } from "../src/server.js";

const previousEnv = { ...process.env };

let issuerApp: ReturnType<typeof Fastify>;
let issuerBaseUrl = "";

beforeAll(async () => {
  const { privateKey, publicKey } = await generateKeyPair("RS256");
  const jwk = await exportJWK(publicKey);
  jwk.kid = "test-key";
  jwk.use = "sig";
  jwk.alg = "RS256";

  issuerApp = Fastify();
  issuerApp.get("/.well-known/jwks.json", async () => ({ keys: [jwk] }));
  await issuerApp.listen({ host: "127.0.0.1", port: 0 });
  const address = issuerApp.server.address();
  if (!address || typeof address === "string") throw new Error("unable to start issuer app");
  issuerBaseUrl = `http://127.0.0.1:${address.port}`;

  process.env.MCP_OAUTH_ISSUER = issuerBaseUrl;
  process.env.MCP_OAUTH_JWKS_URL = `${issuerBaseUrl}/.well-known/jwks.json`;
  process.env.MCP_OAUTH_AUDIENCE = "https://mcp.example.com/mcp";
  process.env.MCP_OAUTH_REQUIRED_SCOPES = "mcp.tools.invoke";

  const token = await new SignJWT({ scope: "mcp.tools.invoke" })
    .setProtectedHeader({ alg: "RS256", kid: "test-key" })
    .setIssuer(issuerBaseUrl)
    .setAudience("https://mcp.example.com/mcp")
    .setExpirationTime("5m")
    .setIssuedAt()
    .sign(privateKey);

  process.env.TEST_VALID_BEARER = token;
});

afterAll(async () => {
  await issuerApp.close();
});

afterEach(() => {
  process.env = { ...previousEnv, TEST_VALID_BEARER: process.env.TEST_VALID_BEARER };
  process.env.MCP_OAUTH_ISSUER = issuerBaseUrl;
  process.env.MCP_OAUTH_JWKS_URL = `${issuerBaseUrl}/.well-known/jwks.json`;
  process.env.MCP_OAUTH_AUDIENCE = "https://mcp.example.com/mcp";
  process.env.MCP_OAUTH_REQUIRED_SCOPES = "mcp.tools.invoke";
});

describe("auth", () => {
  it("rejects missing bearer token when oauth is enabled", async () => {
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
        method: "tools/list",
        params: {},
      },
    });

    expect(response.statusCode).toBe(401);
    await app.close();
  });

  it("accepts valid bearer token from JWKS issuer", async () => {
    const app = buildApp();
    const response = await app.inject({
      method: "POST",
      url: "/mcp",
      headers: {
        authorization: `Bearer ${process.env.TEST_VALID_BEARER}`,
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
          arguments: { message: "secured" },
        },
      },
    });

    expect(response.statusCode).toBe(200);
    await app.close();
  });
});
