import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";

export interface AuthConfig {
  issuer: string;
  audience: string;
  requiredScopes: string[];
  jwksUrl?: string;
}

export function getAuthConfigFromEnv(env: NodeJS.ProcessEnv): AuthConfig | null {
  if (!env.MCP_OAUTH_ISSUER) return null;
  if (!env.MCP_OAUTH_AUDIENCE) {
    throw new Error("MCP_OAUTH_AUDIENCE is required when MCP_OAUTH_ISSUER is set");
  }

  const requiredScopes = (env.MCP_OAUTH_REQUIRED_SCOPES ?? "")
    .split(",")
    .map((scope) => scope.trim())
    .filter(Boolean);

  return {
    issuer: env.MCP_OAUTH_ISSUER,
    audience: env.MCP_OAUTH_AUDIENCE,
    requiredScopes,
    jwksUrl: env.MCP_OAUTH_JWKS_URL,
  };
}

export class AuthError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 401) {
    super(message);
    this.name = "AuthError";
    this.statusCode = statusCode;
  }
}

function extractBearerToken(authHeader?: string): string {
  if (!authHeader) throw new AuthError("Missing Authorization header");
  const [scheme, token] = authHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    throw new AuthError("Authorization header must be Bearer token");
  }
  return token;
}

function assertRequiredScopes(payload: JWTPayload, requiredScopes: string[]): void {
  if (requiredScopes.length === 0) return;

  const scopeClaim = typeof payload.scope === "string" ? payload.scope : "";
  const tokenScopes = new Set(scopeClaim.split(" ").filter(Boolean));
  const missing = requiredScopes.filter((scope) => !tokenScopes.has(scope));
  if (missing.length > 0) {
    throw new AuthError(`Missing required scopes: ${missing.join(", ")}`, 403);
  }
}

const jwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

function getRemoteJwks(url: string) {
  if (!jwksCache.has(url)) {
    jwksCache.set(url, createRemoteJWKSet(new URL(url)));
  }
  return jwksCache.get(url)!;
}

export async function validateBearerToken(authHeader: string | undefined, config: AuthConfig): Promise<JWTPayload> {
  const token = extractBearerToken(authHeader);
  const jwksUrl = config.jwksUrl ?? new URL("/.well-known/jwks.json", config.issuer).toString();
  const jwks = getRemoteJwks(jwksUrl);

  const { payload } = await jwtVerify(token, jwks, {
    issuer: config.issuer,
    audience: config.audience,
  });

  assertRequiredScopes(payload, config.requiredScopes);
  return payload;
}
