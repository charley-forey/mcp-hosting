---
slug: sdk-openai-agents-mcp
url: https://openai.github.io/openai-agents-js/guides/mcp
title: Model Context Protocol (MCP) | OpenAI Agents SDK
author: 
fetched_at: 2026-04-30T20:50:08Z
sha256: cb4026fb67010ab5a0a2fca2a0de1190e67e86d1d91b1daf5b77b98267093a6d
license: site-tos
tier: 2
---
Model Context Protocol (MCP) | OpenAI Agents SDK
- Skip to content 
# Model Context Protocol (MCP)
 The [Model Context Protocol (MCP)](https://modelcontextprotocol.io) is an open protocol that standardizes how applications provide tools and context to LLMs. From the MCP docs:

MCP is an open protocol that standardizes how applications provide context to LLMs. Think of MCP like a USB-C port for AI applications. Just as USB-C provides a standardized way to connect your devices to various peripherals and accessories, MCP provides a standardized way to connect AI models to different data sources and tools.

There are three types of MCP servers this SDK supports:

Hosted MCP server tools – remote MCP servers used as tools by the [OpenAI Responses API](https://platform.openai.com/docs/guides/tools-remote-mcp)

- Streamable HTTP MCP servers – local or remote servers that implement the [Streamable HTTP transport](https://modelcontextprotocol.io/docs/concepts/transports#streamable-http)

- Stdio MCP servers – servers accessed via standard input/output (the simplest option)

**
Note: The SDK also includes `MCPServerSSE` for legacy Server‑Sent Events transports, but SSE has been deprecated by the MCP project. Prefer Streamable HTTP or stdio for new integrations.

Choose a server type based on your use‑case:

What you needRecommended optionCall publicly accessible remote servers with default OpenAI responses models1. Hosted MCP tools**Use publicly accessible remote servers but have the tool calls triggered locally**2. Streamable HTTP**Use locally running Streamable HTTP servers**2. Streamable HTTP**Use any Streamable HTTP servers with non-OpenAI-Responses models**2. Streamable HTTP**Work with local MCP servers that only support the standard-I/O protocol**3. Stdio**

## 1. Hosted MCP server tools
Section titled “1. Hosted MCP server tools”
Hosted tools push the entire round‑trip into the model. Instead of your code calling an MCP server, the OpenAI Responses API invokes the remote tool endpoint and streams the result back to the model.

Here is the simplest example of using hosted MCP tools. You can pass the remote MCP server’s label and URL to the `hostedMcpTool` utility function, which is helpful for creating hosted MCP server tools.

- hostedAgent.ts
```
import { Agent, hostedMcpTool } from '@openai/agents';
export const agent = new Agent({ name: 'MCP Assistant', instructions: 'You must always use the MCP tools to answer questions.', tools: [ hostedMcpTool({ serverLabel: 'gitmcp', serverUrl: 'https://gitmcp.io/openai/codex', }), ],});
```

Then, you can run the Agent with the `run` function (or your own customized `Runner` instance’s `run` method):
Run with hosted MCP tools
```
import { run } from '@openai/agents';import { agent } from './hostedAgent';
async function main() { const result = await run( agent, 'Which language is the repo I pointed in the MCP tool settings written in?', ); console.log(result.finalOutput);}
main().catch(console.error);
```

To stream incremental MCP results, pass `stream: true` when you run the `Agent`:
Run with hosted MCP tools (streaming)
```
import { isOpenAIResponsesRawModelStreamEvent, run } from '@openai/agents';import { agent } from './hostedAgent';
async function main() { const result = await run( agent, 'Which language is the repo I pointed in the MCP tool settings written in?', { stream: true }, );
 for await (const event of result) { if ( isOpenAIResponsesRawModelStreamEvent(event) && event.data.event.type !== 'response.mcp_call_arguments.delta' && event.data.event.type !== 'response.output_text.delta' ) { console.log(`Got event of type ${JSON.stringify(event.data)}`); } } console.log(`Done streaming; final result: ${result.finalOutput}`);}
main().catch(console.error);
```

### Optional approval flow
Section titled “Optional approval flow”
For sensitive operations you can require human approval of individual tool calls. Pass either `requireApproval: 'always'` or a fine‑grained object mapping tool names to `'never'`/`'always'`.
If you can programmatically determine whether a tool call is safe, you can use the [`onApproval` callback](https://github.com/openai/openai-agents-js/blob/main/examples/mcp/hosted-mcp-on-approval.ts) to approve or reject the tool call. If you require human approval, you can use the same [human-in-the-loop (HITL) approach](/openai-agents-js/guides/human-in-the-loop/) using `interruptions` as for local function tools.
Human in the loop with hosted MCP tools
```
import { Agent, run, hostedMcpTool, RunToolApprovalItem } from '@openai/agents';
async function main(): Promisevoid> { const agent = new Agent({ name: 'MCP Assistant', instructions: 'You must always use the MCP tools to answer questions.', tools: [ hostedMcpTool({ serverLabel: 'gitmcp', serverUrl: 'https://gitmcp.io/openai/codex', // 'always' | 'never' | { never, always } requireApproval: { never: { toolNames: ['search_codex_code', 'fetch_codex_documentation'], }, always: { toolNames: ['fetch_generic_url_content'], }, }, }), ], });
 let result = await run(agent, 'Which language is this repo written in?'); while (result.interruptions && result.interruptions.length) { for (const interruption of result.interruptions) { // Human in the loop here const approval = await confirm(interruption); if (approval) { result.state.approve(interruption); } else { result.state.reject(interruption); } } result = await run(agent, result.state); } console.log(result.finalOutput);}
import { stdin, stdout } from 'node:process';import * as readline from 'node:readline/promises';
async function confirm(item: RunToolApprovalItem): Promiseboolean> { const rl = readline.createInterface({ input: stdin, output: stdout }); const name = item.name; const params = item.arguments; const answer = await rl.question( `Approve running tool (mcp: ${name}, params: ${params})? (y/n) `, ); rl.close(); return answer.toLowerCase().trim() === 'y';}
main().catch(console.error);
```

### Hosted MCP options reference
Section titled “Hosted MCP options reference”
`hostedMcpTool(...)` supports both MCP server URLs and connector-backed servers:

OptionTypeNotes`serverLabel``string`Required label that identifies the hosted MCP server in events and traces.`serverUrl``string`Remote MCP server URL (use this for regular hosted MCP servers).`connectorId``string`OpenAI connector id (use this instead of `serverUrl` for connector-backed hosted servers).`authorization``string`Optional authorization token sent to the hosted MCP backend.`headers``Record`Optional extra request headers.`allowedTools``string[] | object`Allowlist of tool names exposed to the model. Pass `string[]` or `{ toolNames?: string[] }`.`deferLoading``boolean`Responses-only deferred loading for hosted MCP tools. Requires `toolSearchTool()` in the same agent.`requireApproval``'never' | 'always' | object`Approval policy for hosted MCP tool calls. Use the object form for per-tool overrides. Defaults to `'never'`.`onApproval`Approval callbackOptional callback for programmatic approval/rejection when `requireApproval` requires approval handling.
Set `deferLoading: true` when you want the model to load a hosted MCP server’s tool definitions on demand via tool search instead of exposing them up front. This only works with the OpenAI Responses API, requires `toolSearchTool()` in the same request, and should be used with GPT-5.4 and newer supported model releases. See the [Tools guide](/openai-agents-js/guides/tools#deferred-tool-loading-with-tool-search) for the full deferred-loading setup.
`requireApproval` object form:

```
{ always?: { toolNames: string[] }; never?: { toolNames: string[] };}
```

`onApproval` signature:

```
async function onApproval( context, item,): Promise approve: boolean; reason?: string;}> {}
```

### Connector-backed hosted servers
Section titled “Connector-backed hosted servers”
Hosted MCP also supports OpenAI connectors. Instead of providing a `serverUrl`, pass the connector’s `connectorId` and an `authorization` token. The Responses API then handles authentication and exposes the connector’s tools through the hosted MCP interface.
Connector-backed hosted MCP tool
```
import { Agent, hostedMcpTool } from '@openai/agents';
const authorization = process.env.GOOGLE_CALENDAR_AUTHORIZATION!;
export const connectorAgent = new Agent({ name: 'Calendar Assistant', instructions: "You are a helpful assistant that can answer questions about the user's calendar.", tools: [ hostedMcpTool({ serverLabel: 'google_calendar', connectorId: 'connector_googlecalendar', authorization, requireApproval: 'never', }), ],});
```

In this example the `GOOGLE_CALENDAR_AUTHORIZATION` environment variable holds an OAuth token obtained from the Google OAuth Playground, which authorizes the connector-backed server to call the Calendar API. For a runnable sample that also demonstrates streaming, see [`examples/connectors`](https://github.com/openai/openai-agents-js/tree/main/examples/connectors).
Fully working samples (Hosted tools/Streamable HTTP/stdio + Streaming, HITL, onApproval) are [examples/mcp](https://github.com/openai/openai-agents-js/tree/main/examples/mcp) in our GitHub repository.

## 2. Streamable HTTP MCP servers
Section titled “2. Streamable HTTP MCP servers”
When your Agent talks directly to a Streamable HTTP MCP server—local or remote—instantiate `MCPServerStreamableHttp` with the server `url`, `name`, and any optional settings:
Run with Streamable HTTP MCP servers
```
import { Agent, run, MCPServerStreamableHttp } from '@openai/agents';
async function main() { const mcpServer = new MCPServerStreamableHttp({ url: 'https://gitmcp.io/openai/codex', name: 'GitMCP Documentation Server', }); const agent = new Agent({ name: 'GitMCP Assistant', instructions: 'Use the tools to respond to user requests.', mcpServers: [mcpServer], });
 try { await mcpServer.connect(); const result = await run(agent, 'Which language is this repo written in?'); console.log(result.finalOutput); } finally { await mcpServer.close(); }}
main().catch(console.error);
```

Constructor options:

OptionTypeNotes`url``string`Streamable HTTP server URL.`name``string`Optional label for the server.`cacheToolsList``boolean`Cache tools list to reduce latency.`clientSessionTimeoutSeconds``number`Timeout for MCP client sessions.`toolFilter``MCPToolFilterCallable | MCPToolFilterStatic`Filter available tools.`toolMetaResolver``MCPToolMetaResolver`Inject per-call MCP `_meta` request fields.`errorFunction``MCPToolErrorFunction | null`Map MCP call failures to model-visible text.`timeout``number`Per-request timeout (milliseconds).`logger``Logger`Custom logger.`authProvider``OAuthClientProvider`OAuth provider from the MCP TypeScript SDK.`requestInit``RequestInit`Fetch init options for requests.`fetch``FetchLike`Custom fetch implementation.`reconnectionOptions``StreamableHTTPReconnectionOptions`Reconnection tuning options.`sessionId``string`Explicit session id for MCP connections.
The constructor also accepts additional MCP TypeScript‑SDK options such as `authProvider`, `requestInit`, `fetch`, `reconnectionOptions`, and `sessionId`. See the [MCP TypeScript SDK repository](https://github.com/modelcontextprotocol/typescript-sdk) and its documents for details.

## 3. Stdio MCP servers
Section titled “3. Stdio MCP servers”
For servers that expose only standard I/O, instantiate `MCPServerStdio` with a `fullCommand`:
Run with Stdio MCP servers
```
import { Agent, run, MCPServerStdio } from '@openai/agents';import * as path from 'node:path';
async function main() { const samplesDir = path.join(__dirname, 'sample_files'); const mcpServer = new MCPServerStdio({ name: 'Filesystem MCP Server, via local package', fullCommand: `pnpm exec mcp-server-filesystem ${samplesDir}`, }); await mcpServer.connect(); try { const agent = new Agent({ name: 'FS MCP Assistant', instructions: 'Use the tools to read the filesystem and answer questions based on those files. If you are unable to find any files, you can say so instead of assuming they exist.', mcpServers: [mcpServer], }); const result = await run(agent, 'Read the files and list them.'); console.log(result.finalOutput); } finally { await mcpServer.close(); }}
main().catch(console.error);
```

Constructor options:

OptionTypeNotes`command` / `args``string` / `string[]`Command + args for stdio servers.`fullCommand``string`Full command string alternative to `command` + `args`.`env``Record`Environment variables for the server process.`cwd``string`Working directory for the server process.`cacheToolsList``boolean`Cache tools list to reduce latency.`clientSessionTimeoutSeconds``number`Timeout for MCP client sessions.`name``string`Optional label for the server.`encoding``string`Encoding for stdio streams.`encodingErrorHandler``'strict' | 'ignore' | 'replace'`Encoding error strategy.`toolFilter``MCPToolFilterCallable | MCPToolFilterStatic`Filter available tools.`toolMetaResolver``MCPToolMetaResolver`Inject per-call MCP `_meta` request fields.`errorFunction``MCPToolErrorFunction | null`Map MCP call failures to model-visible text.`timeout``number`Per-request timeout (milliseconds).`logger``Logger`Custom logger.

## Managing MCP server lifecycle
Section titled “Managing MCP server lifecycle”
When you work with multiple MCP servers, you can use `connectMcpServers` to connect them together, track failures, and close them in one place. The helper returns an `MCPServers` instance with `active`, `failed`, and `errors` collections so you can pass only healthy servers to your agent.
Manage multiple MCP servers
```
import { Agent, MCPServerStreamableHttp, connectMcpServers, run,} from '@openai/agents';
async function main() { const servers = [ new MCPServerStreamableHttp({ url: 'https://mcp.deepwiki.com/mcp', name: 'DeepWiki MCP Server', }), new MCPServerStreamableHttp({ url: 'http://localhost:8001/mcp', name: 'Local MCP Server', }), ];
 const mcpServers = await connectMcpServers(servers, { connectInParallel: true, });
 try { console.log(`Active servers: ${mcpServers.active.length}`); console.log(`Failed servers: ${mcpServers.failed.length}`); for (const [server, error] of mcpServers.errors) { console.warn(`${server.name} failed to connect: ${error.message}`); }
 const agent = new Agent({ name: 'MCP lifecycle agent', instructions: 'Use MCP tools to answer user questions.', mcpServers: mcpServers.active, });
 const result = await run( agent, 'Which language is the openai/codex repository written in?', ); console.log(result.finalOutput); } finally { await mcpServers.close(); }}
main().catch(console.error);
```

Use cases:

Multiple servers at once: connect everything in parallel and use `mcpServers.active` for the agent.

- Partial failure handling: inspect `failed` + `errors` and decide whether to continue or retry.

- Retry failed servers: call `mcpServers.reconnect()` (defaults to retrying failed servers only).

If you want a strict “all or nothing” connection or different timeouts, use `connectMcpServers(servers, options)` and tune the options for your environment.

`connectMcpServers` options:

OptionTypeDefaultNotes`connectTimeoutMs``number | null``10000`Timeout for each server `connect()`. Use `null` to disable.`closeTimeoutMs``number | null``10000`Timeout for each server `close()`. Use `null` to disable.`dropFailed``boolean``true`Exclude failed servers from `active`.`strict``boolean``false`Throw if any server fails to connect.`suppressAbortError``boolean``true`Ignore abort-like errors while still tracking failed servers.`connectInParallel``boolean``false`Connect all servers concurrently instead of sequentially.
`mcpServers.reconnect(options)` supports:

OptionTypeDefaultNotes`failedOnly``boolean``true`Retry only failed servers (`true`) or reconnect all servers (`false`).

### Async disposal (optional)
Section titled “Async disposal (optional)”
If your runtime supports `Symbol.asyncDispose`, `MCPServers` also supports the `await using` pattern. In TypeScript, enable `esnext.disposable` in `tsconfig.json`:

```
{ "compilerOptions": { "lib": ["ES2018", "DOM", "esnext.disposable"] }}
```

Then you can write:

```
await using mcpServers = await connectMcpServers(servers);
```

## Other things to know
Section titled “Other things to know”
For **Streamable HTTP** and **Stdio** servers, each time an `Agent` runs it may call `list_tools()` to discover available tools. Because that round‑trip can add latency—especially to remote servers—you can cache the results in memory by passing `cacheToolsList: true` to `MCPServerStdio` or `MCPServerStreamableHttp`.

Only enable this if you’re confident the tool list won’t change. To invalidate the cache later, call `invalidateToolsCache()` on the server instance. If you are using shared MCP tool caching via `getAllMcpTools(...)`, you can also invalidate by server name with `invalidateServerToolsCache(serverName)`.

For advanced cases, `getAllMcpTools({ generateMCPToolCacheKey })` lets you customize cache partitioning (for example, by server + agent + run context).

### Tool filtering
Section titled “Tool filtering”
You can restrict which tools are exposed from each server by passing either a static filter via `createMCPToolStaticFilter` or a custom function. Here’s a combined example showing both approaches:

Tool filtering
```
import { MCPServerStdio, MCPServerStreamableHttp, createMCPToolStaticFilter, MCPToolFilterContext,} from '@openai/agents';
interface ToolFilterContext { allowAll: boolean;}
const server = new MCPServerStdio({ fullCommand: 'my-server', toolFilter: createMCPToolStaticFilter({ allowed: ['safe_tool'], blocked: ['danger_tool'], }),});
const dynamicServer = new MCPServerStreamableHttp({ url: 'http://localhost:3000', toolFilter: async ({ runContext }: MCPToolFilterContext, tool) => (runContext.context as ToolFilterContext).allowAll || tool.name !== 'admin',});
```

## Further reading
Section titled “Further reading”

- [Model Context Protocol](https://modelcontextprotocol.io/) – official specification.

- [examples/mcp](https://github.com/openai/openai-agents-js/tree/main/examples/mcp) – runnable demos referenced above.
