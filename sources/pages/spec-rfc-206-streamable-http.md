---
slug: spec-rfc-206-streamable-http
url: https://github.com/modelcontextprotocol/modelcontextprotocol/pull/206/files
title: [RFC] Replace HTTP+SSE with new &quot;Streamable HTTP&quot; transport by jspahrsummers · Pull Request #206 · modelcontextprotocol/modelcontextprotocol · GitHub
author: 
fetched_at: 2026-04-30T20:50:31Z
sha256: 21610cd59a407d40a30e88e59d7bebd3635611eebb6354ef1107f260c4acc9f8
license: MIT-spec
tier: 1
---
- [RFC] Replace HTTP+SSE with new "Streamable HTTP" transport by jspahrsummers · Pull Request #206 · modelcontextprotocol/modelcontextprotocol · GitHub

 
 
 
 

 
 

 

 

 
 

 
 

 

 

 

 

 

 

 

 

 

 
 
 

 
 
 

 

 

 
 
 
 

 

 
 
 
 

 
 

 

 
 

 

 

 
 

 
 
 

 

 

 
 
 
 

 
 Skip to content

 
 
 
 
 

 
 
 

 

 

 

 
 
 
 You signed in with another tab or window. Reload to refresh your session.
 You signed out in another tab or window. Reload to refresh your session.
 You switched accounts on another tab or window. Reload to refresh your session.

 Dismiss alert

 

 

 

 

 
 

 
 
 
 
 {{ message }}

 
 

 

 

 
 
 
 
 

 
 

 

 

 

 

 
 
 
 
 
 
 [modelcontextprotocol](/modelcontextprotocol) 
 /
 
 [modelcontextprotocol](/modelcontextprotocol/modelcontextprotocol)
 

 Public
 

 

 
 
 
 

 
 [Notifications](/login?return_to=%2Fmodelcontextprotocol%2Fmodelcontextprotocol) You must be signed in to change notification settings

 
- [Fork
 1.5k](/login?return_to=%2Fmodelcontextprotocol%2Fmodelcontextprotocol)

 
- [Star
 8k](/login?return_to=%2Fmodelcontextprotocol%2Fmodelcontextprotocol)

 
 

 

 

 
 

 
 

 
 
 
 
 
 
 

 

 
 
 
 
# [RFC] Replace HTTP+SSE with new "Streamable HTTP" transport
 #206

 
 
 

 

 
 
 New issue
 
 
 
 
 

 
 **Have a question about this project?** Sign up for a free GitHub account to open an issue and contact its maintainers and the community.
 

 
 [Sign up for GitHub](/signup?return_to=%2Fmodelcontextprotocol%2Fmodelcontextprotocol%2Fissues%2Fnew%2Fchoose)
 

 By clicking “Sign up for GitHub”, you agree to our [terms of service](https://docs.github.com/terms) and
 [privacy statement](https://docs.github.com/privacy). We’ll occasionally send you account related emails.

 
 Already on GitHub?
 [Sign in](/login?return_to=%2Fmodelcontextprotocol%2Fmodelcontextprotocol%2Fissues%2Fnew%2Fchoose)
 to your account
 

 

 
 
 

 
 
 
 Merged

 

 
 [jspahrsummers](/jspahrsummers)
 merged 24 commits into

 [main](/modelcontextprotocol/modelcontextprotocol/tree/main)

from

[justin/new-http-transport](/modelcontextprotocol/modelcontextprotocol/tree/justin/new-http-transport)
 
 
 
 

 Mar 24, 2025

 
 
 

 

 

 
 
 
 +203
 
 
 −29
 
 
 
 
 
 

 

 
 
 
 
 
 
 
 Merged

 

 
 
 
# [RFC] Replace HTTP+SSE with new "Streamable HTTP" transport
 
 #206

 
 
 *

 
 
 Show file tree

 
 Hide file tree

 

 Changes from **all commits**

 
 
 Commits
 
 
 [Show all changes
 
 
 24 commits](/modelcontextprotocol/modelcontextprotocol/pull/206/files)

 
 Select commit
 Hold shift + click to select a range
 
 
 [`ec96e58`
 
 "Streamable HTTP" spec
 
 
 jspahrsummers Mar 17, 2025](/modelcontextprotocol/modelcontextprotocol/pull/206/commits/ec96e584836fc7ee9524e3fc49ec93a43b54588f)
 [`fb8e9ce`
 
 Remove other references to SSE
 
 
 jspahrsummers Mar 17, 2025](/modelcontextprotocol/modelcontextprotocol/pull/206/commits/fb8e9cee7ef36f196ecc2131661ea6c7de16d756)
 [`66a1cdd`
 
 Fix formatting
 
 
 jspahrsummers Mar 17, 2025](/modelcontextprotocol/modelcontextprotocol/pull/206/commits/66a1cddc836c1815bb427a2e30e2207e4d056145)
 [`39af45c`
 
 Explain resumability
 
 
 jspahrsummers Mar 17, 2025](/modelcontextprotocol/modelcontextprotocol/pull/206/commits/39af45cfde3c62bbaed23d41d4a47e90b55db145)
 [`5474985`
 
 Indicate when sessions are resumed vs. created
 
 
 jspahrsummers Mar 17, 2025](/modelcontextprotocol/modelcontextprotocol/pull/206/commits/54749853e7a7ab3fd1110ace223f5dd7c3a63466)
 [`bd504c8`
 
 Change "multiple connections" requirements
 
 
 jspahrsummers Mar 17, 2025](/modelcontextprotocol/modelcontextprotocol/pull/206/commits/bd504c85c0c632cfbfe615d89ac0b4a8c4b3a52e)
 [`048f812`
 
 Rephrase "bidirectional communication"
 
 
 jspahrsummers Mar 17, 2025](/modelcontextprotocol/modelcontextprotocol/pull/206/commits/048f812d0ae743100aeecb4f8e4854e756761ac7)
 [`1917ba4`
 
 Endpoint *path
 
 
 jspahrsummers Mar 17, 2025](/modelcontextprotocol/modelcontextprotocol/pull/206/commits/1917ba423a07d3eab12fb3c295d2e9ef9e940c61)
 [`e0b3493`
 
 GET endpoint can now return 406 Not Acceptable
 
 
 jspahrsummers Mar 17, 2025](/modelcontextprotocol/modelcontextprotocol/pull/206/commits/e0b34935a8f249eebec2a7febd6702fe146fcfd3)
 [`b3364c9`
 
 Provide auth tokens with every request
 
 
 jspahrsummers Mar 18, 2025](/modelcontextprotocol/modelcontextprotocol/pull/206/commits/b3364c94e580e3686777564d4a36c990e124a898)
 [`732fdd2`
 
 Simplify what goes into which stream; disallow streaming on notifs/re…
 
 
 jspahrsummers Mar 18, 2025](/modelcontextprotocol/modelcontextprotocol/pull/206/commits/732fdd2b285da6b8b8e52f3ed0e462539f8ca473)
 [`4001c48`
 
 Resumability should operate on a per-stream basis
 
 
 jspahrsummers Mar 18, 2025](/modelcontextprotocol/modelcontextprotocol/pull/206/commits/4001c482523e73b5710e248eac014cb21b43a9b2)
 [`d5e0a0e`
 
 Establish sessions on server, not client
 
 
 jspahrsummers Mar 18, 2025](/modelcontextprotocol/modelcontextprotocol/pull/206/commits/d5e0a0ece55132b2f8ee495f2338e894b8a99475)
 [`ea699ca`
 
 Update sequence diagram
 
 
 jspahrsummers Mar 18, 2025](/modelcontextprotocol/modelcontextprotocol/pull/206/commits/ea699ca8f4fc02e032c51a7a30ab485f2d9eaa46)
 [`9cffe4f`
 
 Disconnection shouldn't be cancellation
 
 
 jspahrsummers Mar 18, 2025](/modelcontextprotocol/modelcontextprotocol/pull/206/commits/9cffe4f483d904029926fcc978cd332363e989e4)
 [`103bcc0`
 
 SSE stream can close due to session expiry
 
 
 jspahrsummers Mar 18, 2025](/modelcontextprotocol/modelcontextprotocol/pull/206/commits/103bcc00749cbcea056e9ba992b5a715b65c4260)
 [`20399a4`
 
 Allow JSON-RPC response to GET when resuming
 
 
 jspahrsummers Mar 18, 2025](/modelcontextprotocol/modelcontextprotocol/pull/206/commits/20399a4619bd03628bc03cd0cac016e83b87ad51)
 [`06abe2c`
 
 Allow clients to terminate sessions
 
 
 jspahrsummers Mar 18, 2025](/modelcontextprotocol/modelcontextprotocol/pull/206/commits/06abe2cfe47a9c2d079c923348123aac970c4fd4)
 [`fe418dd`
 
 Regenerate JSON schema
 
 
 jspahrsummers Mar 18, 2025](/modelcontextprotocol/modelcontextprotocol/pull/206/commits/fe418dd242ef5fe217f7ac3500c2daceba4fd9b6)
 [`67fe21f`
 
 Merge branch 'main' into justin/new-http-transport
 
 
 jspahrsummers Mar 19, 2025](/modelcontextprotocol/modelcontextprotocol/pull/206/commits/67fe21f548fb0409ad5172a84facef6af62b6dc1)
 [`0f4924b`
 
 Clarify backwards compatibility language
 
 
 jspahrsummers Mar 19, 2025](/modelcontextprotocol/modelcontextprotocol/pull/206/commits/0f4924b07447073cbe1e29fbe64e42d379b52b04)
 [`29fcf7e`
 
 Update docs/specification/draft/basic/transports.md
 
 
 jspahrsummers Mar 24, 2025](/modelcontextprotocol/modelcontextprotocol/pull/206/commits/29fcf7e2c73d1345970e24088b38f62a78ed29d0)
 [`60dbfcd`
 
 Move session ID entirely out of band
 
 
 jspahrsummers Mar 24, 2025](/modelcontextprotocol/modelcontextprotocol/pull/206/commits/60dbfcd970eb1f34ff58ca28f8756352ae65d6e2)
 [`3a57a03`
 
 Formatting
 
 
 jspahrsummers Mar 24, 2025](/modelcontextprotocol/modelcontextprotocol/pull/206/commits/3a57a033865162a09443d4f50992b6e5382d32e6)
 
 
 

 
 
 
 **
 File filter
 **
 
 
 
 
 
 
 
 
 

 
 [Clear filters](/modelcontextprotocol/modelcontextprotocol/pull/206/files)

 

 
 **Conversations**
 
 
 
 
 Failed to load comments. 
 
 
 
 Loading

 

 
 
 
 
 

 
### Uh oh!

 There was an error while loading. Please reload this page.

 
 
 
 

 

 **Jump to**
 
 
 
 Jump to file
 
 
 
 
 
 Failed to load files. 
 
 
 
 Loading

 

 
 
 
 
 

 
### Uh oh!

 There was an error while loading. Please reload this page.

 
 
 

 
 
 
 
 

 
 
 
##### Diff view

 

 

 
 
 
 

 
 
 
##### Diff view

 

 

 
 

 

 
 
 
 
 
 
 

 
 

 
 
 

 

 

 

 

 
 
 
 
 

 
## There are no files selected for viewing

 

 
 
 
 
 
 
 

 
 
 
 

 

 [/modelcontextprotocol/modelcontextprotocol/blob/main/.github/CODEOWNERS#L7](/modelcontextprotocol/modelcontextprotocol/blob/main/.github/CODEOWNERS#L7)

 
 2 changes: 1 addition & 1 deletion
 
 2 

 

 docs/specification/draft/basic/_index.md

 
 
 
 
 

 
 

 
 

 
 

 

 

 
 
 
 
 
 
 
 
 
 
 Show comments
 

 

 [View file](/modelcontextprotocol/modelcontextprotocol/blob/3a57a033865162a09443d4f50992b6e5382d32e6/docs/specification/draft/basic/_index.md)

 

 

 

 

 
[Open in desktop](https://desktop.github.com)

 
 
 
 
 
 

 
 

 
 
 
 
 
 This file contains hidden or bidirectional Unicode text that may be interpreted or compiled differently than what appears below. To review, open the file in an editor that reveals hidden Unicode characters.
 [Learn more about bidirectional Unicode characters](https://github.co/hiddenchars)
 

 [Show hidden characters]({{ revealButtonHref }})

 
 

 
 
 
 
 
 
 Original file line number
 Diff line number
 Diff line change
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 Expand Up
 
 @@ -54,7 +54,7 @@ See the following pages for more details on the different components:
 

 
 

 

 
 ## Auth

 
 

 

 
 **

 
 

 

 
 MCP provides an [Authorization]({{< ref "/specification/draft/basic/authorization" >}})

 
 

 

 
 framework for HTTP+SSE transport. Implementations using HTTP+SSE transport **SHOULD**

 
 

 

 
 framework for use with HTTP. Implementations using an HTTP-based transport **SHOULD**

 
 

 

 
 conform to this specification, whereas implementations using STDIO transport **SHOULD

 
 

 

 
 NOT** follow this specification, and instead retrieve credentials from the environment.

 
 

 

 
 

 
 
 
 
 
 Expand Down
 
 
 

 
 

 

 
 

 
 
 
 
 

 
 
 
 

 

 [/modelcontextprotocol/modelcontextprotocol/blob/main/.github/CODEOWNERS#L7](/modelcontextprotocol/modelcontextprotocol/blob/main/.github/CODEOWNERS#L7)

 
 19 changes: 10 additions & 9 deletions
 
 19 

 

 docs/specification/draft/basic/authorization.md

 
 
 
 
 

 
 

 
 

 
 

 

 

 
 
 
 
 
 
 
 
 
 
 Show comments
 

 

 [View file](/modelcontextprotocol/modelcontextprotocol/blob/3a57a033865162a09443d4f50992b6e5382d32e6/docs/specification/draft/basic/authorization.md)

 

 

 

 

 
[Open in desktop](https://desktop.github.com)

 
 
 
 
 
 

 
 

 
 
 
 
 
 This file contains hidden or bidirectional Unicode text that may be interpreted or compiled differently than what appears below. To review, open the file in an editor that reveals hidden Unicode characters.
 [Learn more about bidirectional Unicode characters](https://github.co/hiddenchars)
 

 [Show hidden characters]({{ revealButtonHref }})

 
 

 
 
 
 
 
 
 Original file line number
 Diff line number
 Diff line change
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 Expand Up
 
 @@ -12,13 +12,13 @@ weight: 15
 

 
 

 

 
 

 
 

 

 
 The Model Context Protocol provides authorization capabilities at the transport level,

 
 

 

 
 enabling MCP clients to make requests to restricted MCP servers on behalf of resource

 
 

 

 
 owners. This specification defines the authorization flow for HTTP+SSE transport.

 
 

 

 
 owners. This specification defines the authorization flow for HTTP-based transports.

 
 

 

 
 

 
 

 

 
 ### 1.2 Protocol Requirements

 
 

 

 
 

 
 

 

 
 Authorization is **OPTIONAL** for MCP implementations. When supported:

 
 

 

 
 

 
 

 

 
 - Implementations using an HTTP+SSE transport **SHOULD** conform to this specification.

 
 

 

 
 - Implementations using an HTTP-based transport **SHOULD** conform to this specification.

 

 
 
 
 
 
 Comment thread

 
 
 jspahrsummers** marked this conversation as resolved.
 

 
 
 
 

 
 
 
 
 

 
 
 
 
 

 
### Uh oh!

 There was an error while loading. Please reload this page.

 
 
 
 

 

 

 
 

 

 
 - Implementations using an STDIO transport **SHOULD NOT** follow this specification, and

 
 

 

 
 instead retrieve credentials from the environment.

 
 

 

 
 - Implementations using alternative transports **MUST** follow established security best

 
 
 
 
 
 Expand Down
 
 
 
 Expand Up
 
 @@ -120,19 +120,17 @@ For example: `MCP-Protocol-Version: 2024-11-05`
 

 
 

 

 
 **

 
 

 

 
 #### 2.3.2 Authorization Base URL

 
 

 

 
 

 
 

 

 
 The authorization base URL **MUST** be determined from the [SSE

 
 

 

 
 endpoint]({{< ref "specification/draft/basic/transports#http-with-sse" >}}) URL by

 
 

 

 
 discarding any existing `path` component. For example:

 
 

 

 
 The authorization base URL **MUST** be determined from the MCP server URL by discarding

 
 

 

 
 any existing `path` component. For example:

 
 

 

 
 

 
 

 

 
 If the SSE endpoint is `https://api.example.com/v1/sse`, then:

 
 

 

 
 If the MCP server URL is `https://api.example.com/v1/mcp`, then:

 
 

 

 
 

 
 

 

 
 - The authorization base URL is `https://api.example.com`

 
 

 

 
 - The metadata endpoint **MUST** be at

 
 

 

 
 `https://api.example.com/.well-known/oauth-authorization-server`

 
 

 

 
 

 
 

 

 
 This ensures authorization endpoints are consistently located at the root level of the

 
 

 

 
 domain serving the SSE endpoint, regardless of any path components in the SSE endpoint

 
 

 

 
 URL.

 
 

 

 
 domain hosting the MCP server, regardless of any path components in the MCP server URL.

 
 

 

 
 

 
 

 

 
 #### 2.3.3 Fallbacks for Servers without Metadata Discovery

 
 

 

 
 

 
 
 
 
 
 Expand All
 
 @@ -147,7 +145,7 @@ For servers that do not implement OAuth 2.0 Authorization Server Metadata, clien
 

 
 

 

 
 | Token Endpoint | /token | Used for token exchange & refresh |

 
 

 

 
 | Registration Endpoint | /register | Used for dynamic client registration |

 
 

 

 
 

 
 

 

 
 For example, with an SSE endpoint of `https://api.example.com/v1/sse`, the default

 
 

 

 
 For example, with an MCP server hosted at `https://api.example.com/v1/mcp`, the default

 
 

 

 
 endpoints would be:

 
 

 

 
 

 
 

 

 
 - `https://api.example.com/authorize`

 
 
 
 
 
 Expand Down
 
 
 
 Expand Up
 
 @@ -253,6 +251,9 @@ requirements for resource requests. Specifically:
 

 
 

 

 
 Authorization: Bearer <access-token>

 
 

 

 
 ```

 
 

 

 
 

 
 

 

 
 Note that authorization **MUST** be included in every HTTP request from client to server,

 
 

 

 
 even if they are part of the same logical session.

 
 

 

 
 

 
 

 

 
 2. Access tokens **MUST NOT** be included in the URI query string

 
 

 

 
 

 
 

 

 
 Example request:

 
 
 
 
 
 Expand Down
 
 
 

 
 

 

 
 

 
 
 
 
 

 
 
 
 

 

 [/modelcontextprotocol/modelcontextprotocol/blob/main/.github/CODEOWNERS#L7](/modelcontextprotocol/modelcontextprotocol/blob/main/.github/CODEOWNERS#L7)

 
 210 changes: 191 additions & 19 deletions
 
 210 

 

 docs/specification/draft/basic/transports.md

 
 
 
 
 

 
 

 
 

 
 

 

 

 
 
 
 
 
 
 
 
 
 
 Show comments
 

 

 [View file](/modelcontextprotocol/modelcontextprotocol/blob/3a57a033865162a09443d4f50992b6e5382d32e6/docs/specification/draft/basic/transports.md)

 

 

 

 

 
[Open in desktop](https://desktop.github.com)

 
 
 
 
 
 

 
 

 
 
 
 
 
 This file contains hidden or bidirectional Unicode text that may be interpreted or compiled differently than what appears below. To review, open the file in an editor that reveals hidden Unicode characters.
 [Learn more about bidirectional Unicode characters](https://github.co/hiddenchars)
 

 [Show hidden characters]({{ revealButtonHref }})

 
 

 
 
 
 
 
 
 Original file line number
 Diff line number
 Diff line change
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 Expand Up
 
 @@ -12,7 +12,7 @@ The protocol currently defines two standard transport mechanisms for client-serv
 

 
 

 

 
 communication:

 
 

 

 
 

 
 

 

 
 1. [stdio](#stdio), communication over standard in and standard out

 
 

 

 
 2. [HTTP with Server-Sent Events](#http-with-sse) (SSE)

 
 

 

 
 2. [Streamable HTTP](#streamable-http)

 
 

 

 
 

 
 

 

 
 Clients **SHOULD** support stdio whenever possible.

 
 

 

 
 

 
 
 
 
 
 Expand Down
 
 
 
 Expand Up
 
 @@ -48,38 +48,210 @@ sequenceDiagram
 

 
 

 

 
 deactivate Server Process

 
 

 

 
 ```

 
 

 

 
 

 
 

 

 
 ## HTTP with SSE

 
 

 

 
 ## Streamable HTTP

 
 

 

 
 

 
 

 

 
 In the **SSE** transport, the server operates as an independent process that can handle

 
 

 

 
 multiple client connections.

 
 

 

 
 {{< callout type="info" >}} This replaces the [HTTP+SSE

 
 

 

 
 transport]({{< ref "/specification/2024-11-05/basic/transports#http-with-sse" >}}) from

 
 

 

 
 protocol version 2024-11-05. See the [backwards compatibility](#backwards-compatibility)

 
 

 

 
 guide below. {{< /callout >}}

 
 

 

 
 

 
 

 

 
 The server **MUST** provide two endpoints:

 
 

 

 
 In the **Streamable HTTP** transport, the server operates as an independent process that

 
 

 

 
 can handle multiple client connections. This transport uses HTTP POST and GET requests.

 
 

 

 
 Server can optionally make use of

 
 

 

 
 [Server-Sent Events](https://en.wikipedia.org/wiki/Server-sent_events) (SSE) to stream

 
 

 

 
 multiple server messages. This permits basic MCP servers, as well as more feature-rich

 
 

 

 
 servers supporting streaming and server-to-client notifications and requests.

 
 

 

 
 

 
 

 

 
 1. An SSE endpoint, for clients to establish a connection and receive messages from the

 
 

 

 
 server

 
 

 

 
 2. A regular HTTP POST endpoint for clients to send messages to the server

 
 

 

 
 The server **MUST** provide a single HTTP endpoint path (hereafter referred to as the

 
 

 

 
 **MCP endpoint**) that supports both POST and GET methods. For example, this could be a

 
 

 

 
 URL like `https://example.com/mcp`.

 

 
 
 
 
 
 Comment thread

 
 
 samuelcolvin** marked this conversation as resolved.
 

 
 
 
 

 
 
 
 
 

 
 
 
 
 

 
### Uh oh!

 There was an error while loading. Please reload this page.

 
 
 
 

 

 

 
 

 

 
 **

 
 

 

 
 When a client connects, the server **MUST** send an `endpoint` event containing a URI for

 
 

 

 
 the client to use for sending messages. All subsequent client messages **MUST** be sent

 
 

 

 
 as HTTP POST requests to this endpoint.

 
 

 

 
 ### Message Exchange

 
 

 

 
 

 
 

 

 
 Server messages are sent as SSE `message` events, with the message content encoded as

 
 

 

 
 JSON in the event data.

 
 

 

 
 1. Every JSON-RPC message sent from the client **MUST** be a new HTTP POST request to the

 

 
 
 
 
 
 Comment thread

 
 
 jspahrsummers** marked this conversation as resolved.
 

 
 
 
 

 
 
 
 
 

 
 
 
 
 

 
### Uh oh!

 There was an error while loading. Please reload this page.

 
 
 
 

 

 

 
 

 

 
 MCP endpoint.

 
 

 

 
 **

 
 

 

 
 2. When the client sends a JSON-RPC _request_ to the MCP endpoint via POST:

 
 

 

 
 

 
 

 

 
 - The client **MUST** include an `Accept` header, listing both `application/json` and

 

 
 
 
 
 
 Comment thread

 
 
 samuelcolvin** marked this conversation as resolved.
 

 
 
 
 

 
 
 
 
 

 
 
 
 
 

 
### Uh oh!

 There was an error while loading. Please reload this page.

 
 
 
 

 
 
 
 
 
 Comment thread

 
 
 **jspahrsummers** marked this conversation as resolved.
 

 
 
 
 

 
 
 
 
 

 
 
 
 
 

 
### Uh oh!

 There was an error while loading. Please reload this page.

 
 
 
 

 

 

 
 

 

 
 `text/event-stream` as supported content types.

 

 
 
 
 
 
 Comment thread

 
 
 **jspahrsummers** marked this conversation as resolved.
 

 
 
 
 

 
 
 
 
 

 
 
 
 
 

 
### Uh oh!

 There was an error while loading. Please reload this page.

 
 
 
 

 

 

 
 

 

 
 - The server **MUST** either return `Content-Type: text/event-stream`, to initiate an

 

 
 
 
 
 
 Comment thread

 

 
 

 
 

 
 
 
 
 
 
 
 
 
 

 
 
 
 
 Copy link

 
 
 
 
 Copy Markdown

 
 
 
 

 
 

 
 Member

 

 
 

 
### samuelcolvin
 

 

 

 

 Mar 19, 2025

 
 
 
 
 
 

 There was a problem hiding this comment.

 

 
 
 

 
### Choose a reason for hiding this comment

 
 The reason will be displayed to describe this comment to others. [Learn more](https://docs.github.com/articles/managing-disruptive-comments/#hiding-a-comment).
 

 

 

 
 
 Since some servers will now return "plain" JSON, two questions occur to me:

- does this mean servers might hang for an extended period of time before/after sending headers, before they return the JSON body - should the spec say anything about how long the client should wait?

- there's the possibility of streaming the JSON body as it's available, as LLMs do (and as our JSON parser jiter supports), should the spec say anything about whether this should be encouraged/expected/allowed?

 
 
 

 

 
 
 
 

 

 
 
 
 
 
 
 
 

 
 
 
 
 Copy link

 
 
 
 
 Copy Markdown

 
 
 
 

 
 

 
 Member

 

 Author

 
 

 
### jspahrsummers
 

 

 

 

 Mar 19, 2025

 
 
 
 
 
 

 There was a problem hiding this comment.

 

 
 
 

 
### Choose a reason for hiding this comment

 
 The reason will be displayed to describe this comment to others. [Learn more](https://docs.github.com/articles/managing-disruptive-comments/#hiding-a-comment).
 

 

 

 
 
 **
does this mean servers might hang for an extended period of time before/after sending headers, before they return the JSON body - should the spec say anything about how long the client should wait?

I think we have a larger TODO here, to put some recommendations about timeouts into the spec, and maybe codify conventions like "issuing a progress notification should reset default timeouts." This is definitely important but probably should happen separate to this PR.

 
 
 

 

 
 
 
 

 

 
 
 
 
 
 
 
 

 
 
 
 
 Copy link

 
 
 
 
 Copy Markdown

 
 
 
 

 
 

 
 Member

 

 Author

 
 

 
### jspahrsummers
 

 

 

 

 Mar 19, 2025

 
 
 
 
 
 

 There was a problem hiding this comment.

 

 
 
 

 
### Choose a reason for hiding this comment

 
 The reason will be displayed to describe this comment to others. [Learn more](https://docs.github.com/articles/managing-disruptive-comments/#hiding-a-comment).
 

 

 

 
 
 
there's the possibility of streaming the JSON body as it's available, as LLMs do (and as our JSON parser jiter supports), should the spec say anything about whether this should be encouraged/expected/allowed?

There's a bigger discussion here about how best to support streaming chunks—on the input side too. I'm inclined to leave mentions out of the current spec but tackle it in follow-ups.

 
 
 

 

 
 
 
 

 

 
 
 
 
 
 
 
 

 
 
 
 
 Copy link

 
 
 
 
 Copy Markdown

 
 
 
 

 
 

 
 Member

 

 
 

 
### dsp-ant
 

 

 

 

 Mar 19, 2025

 
 
 
 
 
 

 There was a problem hiding this comment.

 

 
 
 

 
### Choose a reason for hiding this comment

 
 The reason will be displayed to describe this comment to others. [Learn more](https://docs.github.com/articles/managing-disruptive-comments/#hiding-a-comment).
 

 

 

 
 
 My take here is that (a) timeouts depend on the SDKs and can be freely chosen, but i am okay with giving guidance (b) Clients should only be concerned with starting to parse responses once a newline is detected, so I think clients who CAN do streamed parsing can do so, but clients who cannot sould be fine too. I certainly don't want to expect a streaming json parser as it would raise the bar significantly.

 
 
 

 

 
 
 
 

 

 
 
 
 
 
 
 
 

 
 
 
 
 Copy link

 
 
 
 
 Copy Markdown

 
 
 
 

 
 

 
 Member

 

 
 

 
### samuelcolvin
 

 

 

 

 Mar 19, 2025

 
 
 
 
 
 

 There was a problem hiding this comment.

 

 
 
 

 
### Choose a reason for hiding this comment

 
 The reason will be displayed to describe this comment to others. [Learn more](https://docs.github.com/articles/managing-disruptive-comments/#hiding-a-comment).
 

 

 

 
 
 makes sense.

 
 
 

 

 
 
 
 

 

 
 
 
 
 
 
 
 

 
 
 
 
 Copy link

 
 
 
 
 Copy Markdown

 
 
 
 

 
 

 

 
 

 
### topherbullock
 

 

 

 

 Mar 22, 2025

 
 
 
 
 
 

 There was a problem hiding this comment.

 

 
 
 

 
### Choose a reason for hiding this comment

 
 The reason will be displayed to describe this comment to others. [Learn more](https://docs.github.com/articles/managing-disruptive-comments/#hiding-a-comment).
 

 

 

 
 
 
timeouts depend on the SDKs and can be freely chosen

Ideally timeouts should be exposed as configuration on the client, so that in extenuating circumstances they can be tuned eg. users in APAC calling a server deployed in us-east regions may need to tune higher read timeouts.

 
 
 

 

 
 
 
 

 

 

 

 
 

 

 

 
 

 

 
 SSE stream, or `Content-Type: application/json`, to return a single JSON-RPC

 
 

 

 
 _response_. The client **MUST** support both these cases.

 

 
 
 
 
 
 Comment thread

 
 
 jspahrsummers** marked this conversation as resolved.
 

 
 
 
 

 
 
 
 
 

 
 
 
 
 

 
### Uh oh!

 There was an error while loading. Please reload this page.

 
 
 
 

 
 
 
 
 
 Comment thread

 

 
 

 
 

 
 
 
 
 
 
 
 
 
 

 
 
 
 
 Copy link

 
 
 
 
 Copy Markdown

 
 
 
 

 
 

 
 Contributor

 

 
 

 
### halter73
 

 

 

 

 Mar 17, 2025

 
 •

 
 
 
 
 edited
 
 
 
 
 
 
 
 
 
 Loading

 
 
 
 
 

 Uh oh!

 There was an error while loading. Please reload this page.

 
 
 
 

 

 

 
 
 
 
 
 

 There was a problem hiding this comment.

 

 
 
 

 
### Choose a reason for hiding this comment

 
 The reason will be displayed to describe this comment to others. [Learn more](https://docs.github.com/articles/managing-disruptive-comments/#hiding-a-comment).
 

 

 

 
 
 Given that `EventSource` already does not support POST requests meaning that `fetch` will have to be used by browser-based clients, why not go all the way and allow more than one JSON-RPC message in POST request's streaming request body? That's certainly where my mind goes to when renaming the transport from "HTTP with SSE" to "Streamable HTTP".

While this wouldn't solve the resumability issue by itself, it would vastly simplify the transport. It would be much closer to the stdio transport, and it could potentially support binary data.

And I think it would help with the resumability issue. It greatly simplifies resumability to only have one logical stream per connection like the stdio transport does. That way, you're not stuck managing multiple last-message-ids on the server which seems like a pain.

If a core design principal is that clients should handle complexity where it exists, I'd suggest forcing the client to only have one resumable server-to-client message stream at a time.

 
 
 

 

 
 
 
 

 

 
 
 
 
 
 
 
 

 
 
 
 
 Copy link

 
 
 
 
 Copy Markdown

 
 
 
 

 
 

 
 Contributor

 

 
 

 
### atesgoral
 

 

 

 

 Mar 18, 2025

 
 
 
 
 
 

 There was a problem hiding this comment.

 

 
 
 

 
### Choose a reason for hiding this comment

 
 The reason will be displayed to describe this comment to others. [Learn more](https://docs.github.com/articles/managing-disruptive-comments/#hiding-a-comment).
 

 

 

 
 
 JSON-RPC supports batching. You can pass an array of requests as a JSON-RPC body.

 
 
 

 

 
 
 
 

 

 
 
 
 
 
 
 
 

 
 
 
 
 Copy link

 
 
 
 
 Copy Markdown

 
 
 
 

 
 

 

 
 

 
### dickhardt
 

 

 

 

 Mar 18, 2025

 
 
 
 
 
 

 There was a problem hiding this comment.

 

 
 
 

 
### Choose a reason for hiding this comment

 
 The reason will be displayed to describe this comment to others. [Learn more](https://docs.github.com/articles/managing-disruptive-comments/#hiding-a-comment).
 

 

 

 
 
 FWIW - in OpenID Provider Commands we are proposing a POST that returns either application/json or text/event-stream [https://openid.github.io/openid-provider-commands/main.html](https://openid.github.io/openid-provider-commands/main.html)

 
 
 

 

 
 
 
 

 

 
 
 
 
 
 
 
 

 
 
 
 
 Copy link

 
 
 
 
 Copy Markdown

 
 
 
 

 
 

 
 Member

 

 Author

 
 

 
### jspahrsummers
 

 

 

 

 Mar 18, 2025

 
 
 
 
 
 

 There was a problem hiding this comment.

 

 
 
 

 
### Choose a reason for hiding this comment

 
 The reason will be displayed to describe this comment to others. [Learn more](https://docs.github.com/articles/managing-disruptive-comments/#hiding-a-comment).
 

 

 

 
 
 Supporting batched client -> server messages makes sense! I honestly had forgotten that aspect of JSON-RPC, since we ignored it for so long. 😬

I would like to extend support to streaming request bodies, but I think we should kick the can on this a bit, as it will probably involve significant discussion of its own.

 
 
 

 

 
 
 
 

 

 
 
 
 
 
 
 
 

 
 
 
 
 Copy link

 
 
 
 
 Copy Markdown

 
 
 
 

 
 

 
 Member

 

 Author

 
 

 
### jspahrsummers
 

 

 

 

 Mar 18, 2025

 
 •

 
 
 
 
 edited
 
 
 
 
 
 
 
 
 
 Loading

 
 
 
 
 

 Uh oh!

 There was an error while loading. Please reload this page.

 
 
 
 

 

 

 
 
 
 
 
 

 There was a problem hiding this comment.

 

 
 
 

 
### Choose a reason for hiding this comment

 
 The reason will be displayed to describe this comment to others. [Learn more](https://docs.github.com/articles/managing-disruptive-comments/#hiding-a-comment).
 

 

 

 
 
 I'll punt on batching in this PR* as well, as it also affects the stdio transport and has some wider-ranging implications, but basically I agree we should support it.

 
 
 

 

 
 
 
 

 

 

 

 
 

 

 

 
 

 

 
 - If the server initiates an SSE stream:

 
 

 

 
 - The SSE stream **SHOULD** eventually include a JSON-RPC _response_ message.

 

 
 
 
 
 
 Comment thread

 
 
 **jspahrsummers** marked this conversation as resolved.
 

 
 
 
 

 
 *
 
 
 

 
 
 
 
 

 
### Uh oh!

 There was an error while loading. Please reload this page.

 
 
 
 

 

 

 
 

 

 
 - The server **MAY** send JSON-RPC _requests_ and _notifications_ before sending a

 
 

 

 
 JSON-RPC _response_. These messages **SHOULD** relate to the originating client

 

 
 
 
 
 
 Comment thread

 

 
 

 
 

 
 
 
 
 
 
 
 
 
 

 
 
 
 
 Copy link

 
 
 
 
 Copy Markdown

 
 
 
 

 
 

 
 Member

 

 Author

 
 

 
### jspahrsummers
 

 

 

 

 Mar 24, 2025

 
 
 
 
 
 

 There was a problem hiding this comment.

 

 
 
 

 
### Choose a reason for hiding this comment

 
 The reason will be displayed to describe this comment to others. [Learn more](https://docs.github.com/articles/managing-disruptive-comments/#hiding-a-comment).
 

 

 

 
 
 This is purposely left a bit unspecified at the moment. Your interpretation seems reasonable. Another example would be progress or logging notifications related to a tool call request.

 
 
 

 

 
 
 
 

 

 

 

 
 

 

 

 
 

 

 
 _request_.

 
 

 

 
 - The server **SHOULD NOT** close the SSE stream before sending the JSON-RPC

 
 

 

 
 _response_, unless the [session](#session-management) expires.

 
 

 

 
 - After the JSON-RPC _response_ has been sent, the server **MAY** close the SSE

 
 

 

 
 stream at any time.

 
 

 

 
 - Disconnection **MAY** occur at any time (e.g., due to network conditions).

 
 

 

 
 Therefore:

 
 

 

 
 - Disconnection **SHOULD NOT** be interpreted as the client cancelling its

 
 

 

 
 request.

 
 

 

 
 - To cancel, the client **SHOULD** explicitly send an MCP `CancelledNotification`.

 

 
 
 
 
 
 Comment thread

 

 
 

 
 

 
 
 
 
 
 
 
 
 
 

 
 
 
 
 Copy link

 
 
 
 
 Copy Markdown

 
 
 
 

 
 

 
 Contributor

 

 
 

 
### bhosmer-ant
 

 

 

 

 Mar 19, 2025

 
 
 
 
 
 

 There was a problem hiding this comment.

 

 
 
 

 
### Choose a reason for hiding this comment

 
 The reason will be displayed to describe this comment to others. [Learn more](https://docs.github.com/articles/managing-disruptive-comments/#hiding-a-comment).
 

 

 

 
 
 Possibly dumb question, but: what should the client do if it wants to cancel a request after a disconnection, in the non-resumable case?

 
 
 

 

 
 
 
 

 

 
 
 
 
 
 
 
 

 
 
 
 
 Copy link

 
 
 
 
 Copy Markdown

 
 
 
 

 
 

 
 Member

 

 Author

 
 

 
### jspahrsummers
 

 

 

 

 Mar 19, 2025

 
 
 
 
 
 

 There was a problem hiding this comment.

 

 
 
 

 
### Choose a reason for hiding this comment

 
 The reason will be displayed to describe this comment to others. [Learn more](https://docs.github.com/articles/managing-disruptive-comments/#hiding-a-comment).
 

 

 

 
 
 It can POST the `CancelledNotification` to the MCP endpoint. The notification contains a request ID as a parameter to refer to the thing that it's cancelling, and this ID would have been previously assigned when submitting the long-running request.

 
 
 

 

 
 
 
 

 

 
 
 
 
 
 
 
 

 
 
 
 
 Copy link

 
 
 
 
 Copy Markdown

 
 
 
 

 
 

 

 
 

 
### Padarn
 

 

 

 

 Mar 22, 2025

 
 
 
 
 
 

 There was a problem hiding this comment.

 

 
 
 

 
### Choose a reason for hiding this comment

 
 The reason will be displayed to describe this comment to others. [Learn more](https://docs.github.com/articles/managing-disruptive-comments/#hiding-a-comment).
 

 

 

 
 
 Are there any alternatives here like having support for clients to cancel or discover ongoing requests ? I know that’s a lot of extra complexity but uncanceled requests can cause a lot of challenges

 
 
 

 

 
 
 
 

 

 
 
 
 
 
 
 
 

 
 
 
 
 Copy link

 
 
 
 
 Copy Markdown

 
 
 
 

 
 

 
 Member

 

 Author

 
 

 
### jspahrsummers
 

 

 

 

 Mar 24, 2025

 
 
 
 
 
 

 There was a problem hiding this comment.

 

 
 
 

 
### Choose a reason for hiding this comment

 
 The reason will be displayed to describe this comment to others. [Learn more](https://docs.github.com/articles/managing-disruptive-comments/#hiding-a-comment).
 

 

 

 
 
 Servers and clients should be responsible for automatically timing out requests from each other. We may add more language around this into the spec in future.

 
 
 

 

 
 
 
 

 

 

 

 
 

 

 

 
 

 

 
 - To avoid message loss due to disconnection, the server **MAY** make the stream

 
 

 

 
 [resumable](#resumability-and-redelivery).

 
 

 

 
 **

 
 

 

 
 3. When the client sends a JSON-RPC _notification_ or _response_ to the MCP endpoint via

 
 

 

 
 POST:

 
 

 

 
 

 
 

 

 
 - If the server accepts the message, it **MUST** return HTTP status code 202 Accepted

 
 

 

 
 with no body.

 
 

 

 
 - If the server cannot accept the message, it **MUST** return an HTTP error status

 
 

 

 
 code (e.g., 400 Bad Request). The HTTP response body **MAY** comprise a JSON-RPC

 
 

 

 
 _error response_ that has no `id`.

 
 

 

 
 

 
 

 

 
 4. The client **MAY** also issue an HTTP GET to the MCP endpoint. This can be used to

 
 

 

 
 open an SSE stream, allowing the server to communicate to the client without the

 
 

 

 
 client first sending a JSON-RPC _request_.

 
 

 

 
 - The client **MUST** include an `Accept` header, listing `text/event-stream` as a

 
 

 

 
 supported content type.

 
 

 

 
 - The server **MUST** either return `Content-Type: text/event-stream` in response to

 
 

 

 
 this HTTP GET, or else return HTTP 405 Method Not Allowed, indicating that the

 
 

 

 
 server does not offer an SSE stream at this endpoint.

 
 

 

 
 - If the server initiates an SSE stream:

 
 

 

 
 - The server **MAY** send JSON-RPC _requests_ and _notifications_ on the stream.

 
 

 

 
 These messages **SHOULD** be unrelated to any concurrently-running JSON-RPC

 
 

 

 
 _request_ from the client.

 
 

 

 
 - The server **MUST NOT** send a JSON-RPC _response_ on the stream **unless**

 
 

 

 
 [resuming](#resumability-and-redelivery) a stream associated with a previous

 
 

 

 
 client request.

 
 

 

 
 - The server **MAY** close the SSE stream at any time.

 
 

 

 
 - The client **MAY** close the SSE stream at any time.

 

 
 
 
 
 
 Comment thread

 
 
 jspahrsummers** marked this conversation as resolved.
 

 
 
 
 

 
 
 
 
 

 
 
 
 
 

 
### Uh oh!

 There was an error while loading. Please reload this page.

 
 
 
 

 

 

 
 

 

 
 **

 
 

 

 
 ### Multiple Connections

 
 

 

 
 

 
 

 

 
 1. The client **MAY** remain connected to multiple SSE streams simultaneously.

 
 

 

 
 2. The server **MUST** send each of its JSON-RPC messages on only one of the connected

 
 

 

 
 streams; that is, it **MUST NOT** broadcast the same message across multiple streams.

 
 

 

 
 - The risk of message loss **MAY** be mitigated by making the stream

 
 

 

 
 [resumable](#resumability-and-redelivery).

 
 

 

 
 

 
 

 

 
 ### Resumability and Redelivery

 

 
 
 
 
 
 Comment thread

 
 
 jspahrsummers** marked this conversation as resolved.
 

 
 
 
 

 
 
 
 
 

 
 
 
 
 

 
### Uh oh!

 There was an error while loading. Please reload this page.

 
 
 
 

 

 

 
 

 

 
 **

 
 

 

 
 To support resuming broken connections, and redelivering messages that might otherwise be

 
 

 

 
 lost:

 
 

 

 
 

 
 

 

 
 1. Servers **MAY** attach an `id` field to their SSE events, as described in the

 
 

 

 
 [SSE standard](https://html.spec.whatwg.org/multipage/server-sent-events.html#event-stream-interpretation).

 
 

 

 
 - If present, the ID **MUST** be globally unique across all streams within that

 
 

 

 
 [session](#session-management)—or all streams with that specific client, if session

 
 

 

 
 management is not in use.

 
 

 

 
 2. If the client wishes to resume after a broken connection, it **SHOULD** issue an HTTP

 
 

 

 
 GET to the MCP endpoint, and include the

 

 
 
 
 
 
 Comment thread

 

 
 

 
 

 
 
 
 
 
 
 
 
 
 

 
 
 
 
 Copy link

 
 
 
 
 Copy Markdown

 
 
 
 

 
 

 

 
 

 
### nagl-temporal
 

 

 

 

 Mar 20, 2025

 
 
 
 
 
 

 There was a problem hiding this comment.

 

 
 
 

 
### Choose a reason for hiding this comment

 
 The reason will be displayed to describe this comment to others. [Learn more](https://docs.github.com/articles/managing-disruptive-comments/#hiding-a-comment).
 

 

 

 
 
 How should the server know which session this event id corresponds to? After reading the github discussion, I was expecting the client to remember the `sessionId` from the first `InitializeResult` and pass it to this request, but I don't see that mentioned here.

As a server author, I could choose to embed the session id in every event id, but that seems wasteful.

 
 
 

 

 
 
 
 

 

 
 
 
 
 
 
 
 

 
 
 
 
 Copy link

 
 
 
 
 Copy Markdown

 
 
 
 

 
 

 

 
 

 
### the-vampiire
 

 

 

 

 Mar 20, 2025

 
 
 
 
 
 

 There was a problem hiding this comment.

 

 
 
 

 
### Choose a reason for hiding this comment

 
 The reason will be displayed to describe this comment to others. [Learn more](https://docs.github.com/articles/managing-disruptive-comments/#hiding-a-comment).
 

 

 

 
 
 further complicated by the IDs needing to uniquely identify the stream as well.

i mentioned this in another thread but i think it got buried:

## single stream

[@jspahrsummers](https://github.com/jspahrsummers) is there a reason we dont use a single stream (`/mcp`) as the server channel?

clients send via POST

servers send in the stream

i may be missing something but it seems this would simplify things greatly. it would eliminate the complexity and overhead of multiple streams and ensure that replays are consistent up to a point of failure.

 
 
 

 

 
 
 
 

 

 
 
 
 
 
 
 
 

 
 
 
 
 Copy link

 
 
 
 
 Copy Markdown

 
 
 
 

 
 

 

 
 

 
### PipelineBaron
 

 

 

 

 Mar 23, 2025

 
 
 
 
 
 

 There was a problem hiding this comment.

 

 
 
 

 
### Choose a reason for hiding this comment

 
 The reason will be displayed to describe this comment to others. [Learn more](https://docs.github.com/articles/managing-disruptive-comments/#hiding-a-comment).
 

 

 

 
 
 Multi-stream adds non-trivial complications to the backend instead of a single stream for stream resumption/re-delivery.

In the current spec's single SSE/stream world, backend resumption/redelivery would be done for a single stream. The existing backend complexity of routing messages to the correct stream on the correct machine remains, with the added complexity of buffering messages for that single stream.

However, in a multi-stream world, these backend complexities are multiplied by the number of individual streams within a session. The backend would now have to keep track of what streams are active on possibly different machines to determine session liveliness, and routing messages to the correct streams for a given session is a much more complicated mapping/routing problem. Then, in addition to this more complex routing, mapping, and liveliness, you still have to figure out how to implement per-stream buffering for resumption/re-delivery.

A single stream is 100% the way to go if you plan on keeping the server's complexity minimal.

 
 
 

 

 
 
 
 

 

 
 
 
 
 
 
 
 

 
 
 
 
 Copy link

 
 
 
 
 Copy Markdown

 
 
 
 

 
 

 
 Member

 

 Author

 
 

 
### jspahrsummers
 

 

 

 

 Mar 24, 2025

 
 •

 
 
 
 
 edited
 
 
 
 
 
 
 
 
 
 Loading

 
 
 
 
 

 Uh oh!

 There was an error while loading. Please reload this page.

 
 
 
 

 

 

 
 
 
 
 
 

 There was a problem hiding this comment.

 

 
 
 

 
### Choose a reason for hiding this comment

 
 The reason will be displayed to describe this comment to others. [Learn more](https://docs.github.com/articles/managing-disruptive-comments/#hiding-a-comment).
 

 

 

 
 
 Allowing POST requests to turn into a stream permits a gradual* increase in complexity in server design. For example, a server design might evolve like this (starting from the simplest version to the most complex):

- Plain HTTP server, does not do any streaming.

- Server adds support for streaming responses to individual requests. This alone does not require a message bus.

- Server adds support for resumability and/or introduces server -> client requests. At this point, a message bus/queue would be required.

It's pretty important that 2 can be done without any additional server infrastructure. Resumability is a nice feature but far from required, and this permits servers that *don't* require it to remain quite simple.

If we had only a single stream (like the existing SSE transport), then *all* streaming would require a message bus.

 
 
 

 

 
 
 
 

 

 
 
 
 
 
 
 
 

 
 
 
 
 Copy link

 
 
 
 
 Copy Markdown

 
 
 
 

 
 

 
 Member

 

 Author

 
 

 
### jspahrsummers
 

 

 

 

 Mar 24, 2025

 
 •

 
 
 
 
 edited
 
 
 
 
 
 
 
 
 
 Loading

 
 
 
 
 

 Uh oh!

 There was an error while loading. Please reload this page.

 
 
 
 

 

 

 
 
 
 
 
 

 There was a problem hiding this comment.

 

 
 
 

 
### Choose a reason for hiding this comment

 
 The reason will be displayed to describe this comment to others. [Learn more](https://docs.github.com/articles/managing-disruptive-comments/#hiding-a-comment).
 

 

 

 
 
 
How should the server know which session this event id corresponds to? After reading the github discussion, I was expecting the client to remember the `sessionId` from the first `InitializeResult` and pass it to this request, but I don't see that mentioned here.

[@nagl-temporal](https://github.com/nagl-temporal) As described in the "session management" section, the session ID header should be attached to all subsequent HTTP requests.

 
 
 

 

 
 
 
 

 

 
 
 
 
 
 
 
 

 
 
 
 
 Copy link

 
 
 
 
 Copy Markdown

 
 
 
 

 
 

 

 
 

 
### PipelineBaron
 

 

 

 

 Mar 24, 2025

 
 
 
 
 
 

 There was a problem hiding this comment.

 

 
 
 

 
### Choose a reason for hiding this comment

 
 The reason will be displayed to describe this comment to others. [Learn more](https://docs.github.com/articles/managing-disruptive-comments/#hiding-a-comment).
 

 

 

 
 
 
Allowing POST requests to turn into a stream permits a *gradual* increase in complexity in server design. For example, a server design might evolve like this (starting from the simplest version to the most complex):

- Plain HTTP server, does not do any streaming.

I agree that a *gradual* increase in complexity for server design is a goal the protocol should optimize for. However, per-request streams are orthogonal from letting a JSON-RPC POST request return the corresponding JSON-RPC response. You can still support that without adopting multi-stream.

- Server adds support for streaming responses to individual requests. This alone does not require a message bus.
...
It's pretty important that 2 can be done without any additional server infrastructure. Resumability is a nice feature but far from required, and this permits servers that don't require it to remain quite simple.

If we had only a single stream (like the existing SSE transport), then *all* streaming would require a message bus.

This isn't true in any multi-server production system. The instant any other request/event can impact the results streamed from another production machine, a message bus will be required.

# Alternatives Approaches

Single stream, multi-subscription. Keep a streaming endpoint, make it available only if the client/server agree on it as a supported capability and expose cancellable subscriptions through that single streaming endpoint.

 
 
 

 

 
 
 
 

 

 

 

 
 

 

 

 
 

 

 
 [`Last-Event-ID`](https://html.spec.whatwg.org/multipage/server-sent-events.html#the-last-event-id-header)

 
 

 

 
 header to indicate the last event ID it received.

 
 

 

 
 - The server **MAY** use this header to replay messages that would have been sent

 
 

 

 
 after the last event ID, _on the stream that was disconnected_, and to resume the

 
 

 

 
 stream from that point.

 
 

 

 
 - The server **MUST NOT** replay messages that would have been delivered on a

 
 

 

 
 different stream.

 
 

 

 
 

 
 

 

 
 In other words, these event IDs should be assigned by servers on a _per-stream_ basis, to

 
 

 

 
 act as a cursor within that particular stream.

 

 
 
 
 
 
 Comment thread

 
 
 jspahrsummers** marked this conversation as resolved.
 

 
 
 
 

 
 
 
 
 

 
 
 
 
 

 
### Uh oh!

 There was an error while loading. Please reload this page.

 
 
 
 

 

 

 
 

 

 
 

 
 

 

 
 ### Session Management

 
 

 

 
 

 
 

 

 
 An MCP "session" consists of logically related interactions between a client and a

 
 

 

 
 server, beginning with the [initialization phase]({{< ref "lifecycle" >}}). To support

 
 

 

 
 servers which want to establish stateful sessions:

 

 
 
 
 
 
 Comment thread

 

 
 

 
 
 
 Comment on lines

 
 +159
 to 
 +160
 

 

 

 
 
 
 
 
 
 
 
 
 

 
 
 
 
 Copy link

 
 
 
 
 Copy Markdown

 
 
 
 

 
 

 
 Member

 

 
 

 
### dsp-ant
 

 

 

 

 Mar 24, 2025

 
 
 
 
 
 

 There was a problem hiding this comment.

 

 
 
 

 
### Choose a reason for hiding this comment

 
 The reason will be displayed to describe this comment to others. [Learn more](https://docs.github.com/articles/managing-disruptive-comments/#hiding-a-comment).
 

 

 

 
 
 not sure that's needed. Is there a world where we can just always let the server start a session at any point by sending a session id?

 
 
 

 

 
 
 
 

 

 
 
 
 
 
 
 
 

 
 
 
 
 Copy link

 
 
 
 
 Copy Markdown

 
 
 
 

 
 

 
 Member

 

 Author

 
 

 
### jspahrsummers
 

 

 

 

 Mar 24, 2025

 
 •

 
 
 
 
 edited
 
 
 
 
 
 
 
 
 
 Loading

 
 
 
 
 

 Uh oh!

 There was an error while loading. Please reload this page.

 
 
 
 

 

 

 
 
 
 
 
 

 There was a problem hiding this comment.

 

 
 
 

 
### Choose a reason for hiding this comment

 
 The reason will be displayed to describe this comment to others. [Learn more](https://docs.github.com/articles/managing-disruptive-comments/#hiding-a-comment).
 

 

 

 
 
 I don't want clients to have to figure out what it means for servers to return a session ID at any time. It introduces synchronization challenges for both sides, since (e.g.) it could happen on 1 out of N concurrent streams, or even multiple times on different streams.

 
 
 

 

 
 
 
 

 

 

 

 
 

 

 

 
 

 

 
 

 
 

 

 
 1. A server using the Streamable HTTP transport **MAY** assign a session ID at

 
 

 

 
 initialization time, by including it in an `Mcp-Session-Id` header on the HTTP

 
 

 

 
 response containing the `InitializeResult`.

 
 

 

 
 - The session ID **SHOULD** be globally unique and cryptographically secure (e.g., a

 
 

 

 
 securely generated UUID, a JWT, or a cryptographic hash).

 
 

 

 
 - The session ID **MUST** only contain visible ASCII characters (ranging from 0x21 to

 
 

 

 
 0x7E).

 
 

 

 
 2. If an `Mcp-Session-Id` is returned by the server during initialization, clients using

 
 

 

 
 the Streamable HTTP transport **MUST** include it in the `Mcp-Session-Id` header on

 
 

 

 
 all of their subsequent HTTP requests.

 
 

 

 
 - Servers that require a session ID **SHOULD** respond to requests without an

 
 

 

 
 `Mcp-Session-Id` header (other than initialization) with HTTP 400 Bad Request.

 
 

 

 
 3. The server **MAY** terminate the session at any time, after which it **MUST** respond

 
 

 

 
 to requests containing that session ID with HTTP 404 Not Found.

 
 

 

 
 4. When a client receives HTTP 404 in response to a request containing an

 
 

 

 
 `Mcp-Session-Id`, it **MUST** start a new session by sending a new `InitializeRequest`

 
 

 

 
 without a session ID attached.

 
 

 

 
 5. Clients that no longer need a particular session (e.g., because the user is leaving

 
 

 

 
 the client application) **SHOULD** send an HTTP DELETE to the MCP endpoint with the

 
 

 

 
 `Mcp-Session-Id` header, to explicitly terminate the session.

 
 

 

 
 - The server **MAY** respond to this request with HTTP 405 Method Not Allowed,

 
 

 

 
 indicating that the server does not allow clients to terminate sessions.

 
 

 

 
 

 
 

 

 
 ### Sequence Diagram

 
 

 

 
 

 
 

 

 
 ```mermaid

 
 

 

 
 sequenceDiagram

 
 

 

 
 participant Client

 
 

 

 
 participant Server

 
 

 

 
 

 
 

 

 
 Client->>Server: Open SSE connection

 
 

 

 
 Server->>Client: endpoint event

 
 

 

 
 loop Message Exchange

 
 

 

 
 Client->>Server: HTTP POST messages

 
 

 

 
 Server->>Client: SSE message events

 
 

 

 
 note over Client, Server: initialization

 
 

 

 
 

 
 

 

 
 Client->>+Server: POST InitializeRequest

 
 

 

 
 Server->>-Client: InitializeResponse<br>Mcp-Session-Id: 1868a90c...

 
 

 

 
 

 
 

 

 
 Client->>+Server: POST InitializedNotification<br>Mcp-Session-Id: 1868a90c...

 
 

 

 
 Server->>-Client: 202 Accepted

 
 

 

 
 

 
 

 

 
 note over Client, Server: client requests

 
 

 

 
 Client->>+Server: POST ... request ...<br>Mcp-Session-Id: 1868a90c...

 
 

 

 
 

 
 

 

 
 alt single HTTP response

 
 

 

 
 Server->>Client: ... response ...

 
 

 

 
 else server opens SSE stream

 
 

 

 
 loop while connection remains open

 
 

 

 
 Server-)Client: ... SSE messages from server ...

 
 

 

 
 end

 
 

 

 
 Server-)Client: SSE event: ... response ...

 
 

 

 
 end

 
 

 

 
 deactivate Server

 
 

 

 
 

 
 

 

 
 note over Client, Server: client notifications/responses

 
 

 

 
 Client->>+Server: POST ... notification/response ...<br>Mcp-Session-Id: 1868a90c...

 
 

 

 
 Server->>-Client: 202 Accepted

 
 

 

 
 

 
 

 

 
 note over Client, Server: server requests

 
 

 

 
 Client->>+Server: GET<br>Mcp-Session-Id: 1868a90c...

 
 

 

 
 loop while connection remains open

 
 

 

 
 Server-)Client: ... SSE messages from server ...

 
 

 

 
 end

 
 

 

 
 Client->>Server: Close SSE connection

 
 

 

 
 deactivate Server

 
 

 

 
 

 
 

 

 
 ```

 
 

 

 
 

 
 

 

 
 ### Backwards Compatibility

 
 

 

 
 

 
 

 

 
 Clients and servers can maintain backwards compatibility with the deprecated [HTTP+SSE

 
 

 

 
 transport]({{< ref "/specification/2024-11-05/basic/transports#http-with-sse" >}}) (from

 
 

 

 
 protocol version 2024-11-05) as follows:

 
 

 

 
 

 
 

 

 
 **Servers** wanting to support older clients should:

 
 

 

 
 

 
 

 

 
 - Continue to host both the SSE and POST endpoints of the old transport, alongside the

 
 

 

 
 new "MCP endpoint" defined for the Streamable HTTP transport.

 
 

 

 
 - It is also possible to combine the old POST endpoint and the new MCP endpoint, but

 
 

 

 
 this may introduce unneeded complexity.

 
 

 

 
 

 
 

 

 
 **Clients** wanting to support older servers should:

 
 

 

 
 

 
 

 

 
 1. Accept an MCP server URL from the user, which may point to either a server using the

 
 

 

 
 old transport or the new transport.

 
 

 

 
 2. Attempt to POST an `InitializeRequest` to the server URL, with an `Accept` header as

 
 

 

 
 defined above:

 
 

 

 
 - If it succeeds, the client can assume this is a server supporting the new Streamable

 
 

 

 
 HTTP transport.

 
 

 

 
 - If it fails with an HTTP 4xx status code (e.g., 405 Method Not Allowed or 404 Not

 
 

 

 
 Found):

 
 

 

 
 - Issue a GET request to the server URL, expecting that this will open an SSE stream

 
 

 

 
 and return an `endpoint` event as the first event.

 
 

 

 
 - When the `endpoint` event arrives, the client can assume this is a server running

 
 

 

 
 the old HTTP+SSE transport, and should use that transport for all subsequent

 
 

 

 
 communication.

 
 

 

 
 

 
 

 

 
 ## Custom Transports

 
 

 

 
 

 
 

 

 
 Clients and servers **MAY** implement additional custom transport mechanisms to suit

 
 
 
 
 
 Expand Down
 
 
 

 
 

 

 
 

 
 
 
 
 

 
 
 
 

 

 [/modelcontextprotocol/modelcontextprotocol/blob/main/.github/CODEOWNERS#L8](/modelcontextprotocol/modelcontextprotocol/blob/main/.github/CODEOWNERS#L8)

 
 1 change: 1 addition & 0 deletions
 
 1 

 

 schema/draft/schema.ts

 
 
 
 
 

 
 

 
 

 

 

 
 
 
 
 
 
 
 
 
 
 Show comments
 

 

 [View file](/modelcontextprotocol/modelcontextprotocol/blob/3a57a033865162a09443d4f50992b6e5382d32e6/schema/draft/schema.ts)

 

 

 

 

 
[Open in desktop](https://desktop.github.com)

 
 
 
 
 
 

 
 

 
 
 
 
 
 This file contains hidden or bidirectional Unicode text that may be interpreted or compiled differently than what appears below. To review, open the file in an editor that reveals hidden Unicode characters.
 [Learn more about bidirectional Unicode characters](https://github.co/hiddenchars)
 

 [Show hidden characters]({{ revealButtonHref }})

 
 

 
 
 
 
 
 
 Original file line number
 Diff line number
 Diff line change
 
 
 
 
 
 
 
 
 
 Expand Up
 
 @@ -167,6 +167,7 @@ export interface InitializeResult extends Result {
 

 
 

 

 
 protocolVersion: string;

 
 

 

 
 capabilities: ServerCapabilities;

 
 

 

 
 serverInfo: Implementation;

 
 

 

 
 

 
 

 

 
 /**

 
 

 

 
 * Instructions describing how to use the server and its features.

 
 

 

 
 *

 
 
 
 
 
 Expand Down
 
 
 

 
 

 

 
 

 
 
 
 
 
 Add this suggestion to a batch that can be applied as a single commit.
 This suggestion is invalid because no changes were made to the code.
 Suggestions cannot be applied while the pull request is closed.
 Suggestions cannot be applied while viewing a subset of changes.
 Only one suggestion per line can be applied in a batch.
 Add this suggestion to a batch that can be applied as a single commit.
 Applying suggestions on deleted lines is not supported.
 You must change the existing code in this line in order to create a valid suggestion.
 Outdated suggestions cannot be applied.
 This suggestion has been applied or marked resolved.
 Suggestions cannot be applied from pending reviews.
 Suggestions cannot be applied on multi-line comments.
 Suggestions cannot be applied while the pull request is queued to merge.
 Suggestion cannot be applied right now. Please check back later.
 
 
 

 

 

 
 

 

 

 

 
 
 
 You can’t perform that action at this time.
