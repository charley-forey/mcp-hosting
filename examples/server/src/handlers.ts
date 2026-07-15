export interface JsonRpcRequest {
  jsonrpc: string;
  id?: string | number | null;
  method: string;
  params?: Record<string, unknown>;
}

export interface HandlerContext {
  protocolVersion: string;
}

export type HandlerResult =
  | { kind: "json"; body: unknown }
  | { kind: "accepted" }
  | { kind: "sse"; events: string[] };

const SUPPORTED_PROTOCOL = "2025-06-18";

function jsonRpcResult(id: JsonRpcRequest["id"], result: unknown) {
  return {
    jsonrpc: "2.0",
    id: id ?? null,
    result,
  };
}

function jsonRpcError(id: JsonRpcRequest["id"], code: number, message: string, data?: unknown) {
  return {
    jsonrpc: "2.0",
    id: id ?? null,
    error: {
      code,
      message,
      ...(data !== undefined ? { data } : {}),
    },
  };
}

export function resolveMcpName(method: string, params?: Record<string, unknown>): string | undefined {
  if (!params) return undefined;
  if (method === "tools/call" || method === "prompts/get") {
    return typeof params.name === "string" ? params.name : undefined;
  }
  if (method === "resources/read") {
    return typeof params.uri === "string" ? params.uri : undefined;
  }
  return undefined;
}

export function handleRpcRequest(request: JsonRpcRequest, _ctx: HandlerContext): HandlerResult {
  if (request.jsonrpc !== "2.0") {
    return {
      kind: "json",
      body: jsonRpcError(request.id, -32600, "Invalid Request", "jsonrpc must be 2.0"),
    };
  }

  switch (request.method) {
    case "initialize": {
      const result = {
        protocolVersion: SUPPORTED_PROTOCOL,
        serverInfo: {
          name: "mcp-hosting-reference-server",
          version: "0.1.0",
        },
        capabilities: {
          tools: {},
          resources: {},
        },
      };
      return { kind: "json", body: jsonRpcResult(request.id, result) };
    }

    case "tools/list": {
      const tools = [
        {
          name: "echo",
          description: "Echo a provided message",
          inputSchema: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
            required: ["message"],
          },
        },
        {
          name: "stream_echo",
          description: "Stream an echo response over SSE",
          inputSchema: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
            required: ["message"],
          },
        },
      ];
      return { kind: "json", body: jsonRpcResult(request.id, { tools }) };
    }

    case "tools/call": {
      const name = request.params?.name;
      const args = (request.params?.arguments as Record<string, unknown> | undefined) ?? {};

      if (typeof name !== "string") {
        return { kind: "json", body: jsonRpcError(request.id, -32602, "Invalid params", "name is required") };
      }

      if (name === "echo") {
        const message = typeof args.message === "string" ? args.message : "";
        return {
          kind: "json",
          body: jsonRpcResult(request.id, {
            content: [{ type: "text", text: message }],
            structuredContent: { echoed: message },
          }),
        };
      }

      if (name === "stream_echo") {
        const message = typeof args.message === "string" ? args.message : "";
        const finalResponse = jsonRpcResult(request.id, {
          content: [{ type: "text", text: message }],
          structuredContent: { echoed: message, streamed: true },
        });

        const events = [
          `event: message\ndata: ${JSON.stringify({
            jsonrpc: "2.0",
            method: "notifications/progress",
            params: { progress: 0.25, message: "accepted" },
          })}\n\n`,
          `event: message\ndata: ${JSON.stringify({
            jsonrpc: "2.0",
            method: "notifications/progress",
            params: { progress: 0.75, message: "processing" },
          })}\n\n`,
          `event: message\ndata: ${JSON.stringify(finalResponse)}\n\n`,
        ];
        return { kind: "sse", events };
      }

      return {
        kind: "json",
        body: jsonRpcError(request.id, -32601, `Unknown tool: ${name}`),
      };
    }

    case "resources/list": {
      const resources = [
        {
          uri: "resource://handbook/status",
          name: "Handbook status",
          description: "Shows basic status for the reference server.",
          mimeType: "application/json",
        },
      ];
      return { kind: "json", body: jsonRpcResult(request.id, { resources }) };
    }

    case "resources/read": {
      const uri = request.params?.uri;
      if (uri !== "resource://handbook/status") {
        return { kind: "json", body: jsonRpcError(request.id, -32602, "Invalid params", "unknown uri") };
      }

      const contents = [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify(
            {
              status: "ok",
              protocolVersion: SUPPORTED_PROTOCOL,
            },
            null,
            2
          ),
        },
      ];
      return { kind: "json", body: jsonRpcResult(request.id, { contents }) };
    }

    default:
      return {
        kind: "json",
        body: jsonRpcError(request.id, -32601, `Method not found: ${request.method}`),
      };
  }
}
