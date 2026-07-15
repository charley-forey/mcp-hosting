---
slug: spec-lifecycle
url: https://modelcontextprotocol.io/specification/2025-06-18/basic/lifecycle
title: Lifecycle - Model Context Protocol
author: 
fetched_at: 2026-04-30T20:49:59Z
sha256: 5c7f377954166d7d5d9c02e50b3a3c4b216b7ba8b291e2e50719d7f67cbb724d
license: MIT-spec
tier: 1
---
- Lifecycle - Model Context ProtocolSkip to main content[Model Context Protocol home page](/)[Documentation](/docs/getting-started/intro)[Extensions](/extensions/overview)[Specification](/specification/2025-06-18)[Registry](/registry/about)[SEPs](/seps)[Community](/community/contributing)[Specification](/specification/2025-06-18)
- [Key Changes](/specification/2025-06-18/changelog)
- [Architecture](/specification/2025-06-18/architecture)
##### Base Protocol

- [Overview](/specification/2025-06-18/basic)
- [Lifecycle](/specification/2025-06-18/basic/lifecycle)
- [Transports](/specification/2025-06-18/basic/transports)
- [Authorization](/specification/2025-06-18/basic/authorization)
- 
##### Client Features

- [Roots](/specification/2025-06-18/client/roots)
- [Sampling](/specification/2025-06-18/client/sampling)
- [Elicitation](/specification/2025-06-18/client/elicitation)
##### Server Features

- [Overview](/specification/2025-06-18/server)
- [Prompts](/specification/2025-06-18/server/prompts)
- [Resources](/specification/2025-06-18/server/resources)
- [Tools](/specification/2025-06-18/server/tools)
- 
- [Schema Reference](/specification/2025-06-18/schema)
- Lifecycle Phases
- Initialization
- Version Negotiation
- Capability Negotiation
- Operation
- Shutdown
- stdio
- HTTP
- Timeouts
- Error Handling**
## Documentation Index
Fetch the complete documentation index at: [https://modelcontextprotocol.io/llms.txt](https://modelcontextprotocol.io/llms.txt)

Use this file to discover all available pages before exploring further.

The Model Context Protocol (MCP) defines a rigorous lifecycle for client-server
connections that ensures proper capability negotiation and state management.

- Initialization: Capability negotiation and protocol version agreement

- Operation: Normal protocol communication

- Shutdown: Graceful termination of the connection

## ​Lifecycle Phases

### ​Initialization

The initialization phase MUST** be the first interaction between client and server.
During this phase, the client and server:

- Establish protocol version compatibility

- Exchange and negotiate capabilities

- Share implementation details

The client **MUST** initiate this phase by sending an `initialize` request containing:

- Protocol version supported

- Client capabilities

- Client implementation information

```
{
 "jsonrpc": "2.0",
 "id": 1,
 "method": "initialize",
 "params": {
 "protocolVersion": "2025-06-18",
 "capabilities": {
 "roots": {
 "listChanged": true
 },
 "sampling": {},
 "elicitation": {}
 },
 "clientInfo": {
 "name": "ExampleClient",
 "title": "Example Client Display Name",
 "version": "1.0.0"
 }
 }
}
```

The server **MUST** respond with its own capabilities and information:

```
{
 "jsonrpc": "2.0",
 "id": 1,
 "result": {
 "protocolVersion": "2025-06-18",
 "capabilities": {
 "logging": {},
 "prompts": {
 "listChanged": true
 },
 "resources": {
 "subscribe": true,
 "listChanged": true
 },
 "tools": {
 "listChanged": true
 }
 },
 "serverInfo": {
 "name": "ExampleServer",
 "title": "Example Server Display Name",
 "version": "1.0.0"
 },
 "instructions": "Optional instructions for the client"
 }
}
```

After successful initialization, the client **MUST** send an `initialized` notification
to indicate it is ready to begin normal operations:

```
{
 "jsonrpc": "2.0",
 "method": "notifications/initialized"
}
```

- The client SHOULD NOT send requests other than
[pings](/specification/2025-06-18/basic/utilities/ping) before the server has responded to the
`initialize` request.

- The server SHOULD NOT send requests other than
[pings](/specification/2025-06-18/basic/utilities/ping) and
[logging](/specification/2025-06-18/server/utilities/logging) before receiving the `initialized`
notification.

#### ​Version Negotiation

In the `initialize` request, the client **MUST** send a protocol version it supports.
This **SHOULD** be the *latest* version supported by the client.
If the server supports the requested protocol version, it **MUST** respond with the same
version. Otherwise, the server **MUST** respond with another protocol version it
supports. This **SHOULD** be the *latest* version supported by the server.
If the client does not support the version in the server’s response, it **SHOULD**
disconnect.
If using HTTP, the client **MUST** include the `MCP-Protocol-Version: ` HTTP header on all subsequent requests to the MCP
server.
For details, see [the Protocol Version Header section in Transports](/specification/2025-06-18/basic/transports#protocol-version-header).

#### ​Capability Negotiation

Client and server capabilities establish which optional protocol features will be
available during the session.
Key capabilities include:
CategoryCapabilityDescriptionClient`roots`Ability to provide filesystem [roots](/specification/2025-06-18/client/roots)Client`sampling`Support for LLM [sampling](/specification/2025-06-18/client/sampling) requestsClient`elicitation`Support for server [elicitation](/specification/2025-06-18/client/elicitation) requestsClient`experimental`Describes support for non-standard experimental featuresServer`prompts`Offers [prompt templates](/specification/2025-06-18/server/prompts)Server`resources`Provides readable [resources](/specification/2025-06-18/server/resources)Server`tools`Exposes callable [tools](/specification/2025-06-18/server/tools)Server`logging`Emits structured [log messages](/specification/2025-06-18/server/utilities/logging)Server`completions`Supports argument [autocompletion](/specification/2025-06-18/server/utilities/completion)Server`experimental`Describes support for non-standard experimental features
Capability objects can describe sub-capabilities like:

- `listChanged`: Support for list change notifications (for prompts, resources, and
tools)

- `subscribe`: Support for subscribing to individual items’ changes (resources only)

### ​Operation

During the operation phase, the client and server exchange messages according to the
negotiated capabilities.
Both parties **MUST**:

- Respect the negotiated protocol version

- Only use capabilities that were successfully negotiated

### ​Shutdown

During the shutdown phase, one side (usually the client) cleanly terminates the protocol
connection. No specific shutdown messages are defined—instead, the underlying transport
mechanism should be used to signal connection termination:

#### ​stdio

For the stdio [transport](/specification/2025-06-18/basic/transports), the client **SHOULD** initiate
shutdown by:

- First, closing the input stream to the child process (the server)

- Waiting for the server to exit, or sending `SIGTERM` if the server does not exit
within a reasonable time

- Sending `SIGKILL` if the server does not exit within a reasonable time after `SIGTERM`

The server **MAY** initiate shutdown by closing its output stream to the client and
exiting.

#### ​HTTP

For HTTP [transports](/specification/2025-06-18/basic/transports), shutdown is indicated by closing the
associated HTTP connection(s).

## ​Timeouts

Implementations **SHOULD** establish timeouts for all sent requests, to prevent hung
connections and resource exhaustion. When the request has not received a success or error
response within the timeout period, the sender **SHOULD** issue a [cancellation
notification](/specification/2025-06-18/basic/utilities/cancellation) for that request and stop waiting for
a response.
SDKs and other middleware **SHOULD** allow these timeouts to be configured on a
per-request basis.
Implementations **MAY** choose to reset the timeout clock when receiving a [progress
notification](/specification/2025-06-18/basic/utilities/progress) corresponding to the request, as this
implies that work is actually happening. However, implementations **SHOULD** always
enforce a maximum timeout, regardless of progress notifications, to limit the impact of a
misbehaving client or server.

## ​Error Handling

Implementations **SHOULD** be prepared to handle these error cases:

- Protocol version mismatch

- Failure to negotiate required capabilities

- Request timeouts

Example initialization error:

```
{
 "jsonrpc": "2.0",
 "id": 1,
 "error": {
 "code": -32602,
 "message": "Unsupported protocol version",
 "data": {
 "supported": ["2024-11-05"],
 "requested": "1.0.0"
 }
 }
}
```
Was this page helpful?

[Overview](/specification/2025-06-18/basic)[Transports](/specification/2025-06-18/basic/transports)⌘I
