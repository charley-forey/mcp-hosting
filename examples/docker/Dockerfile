# Reference Dockerfile for a streamable HTTP MCP server.
# Adapt the base image and install steps to your runtime (this example
# assumes a Node.js MCP). The pattern is what matters: multi-stage,
# distroless, non-root, no shell in the final image.

# ---- Build stage ------------------------------------------------------------
FROM node:20-bookworm-slim AS build
WORKDIR /src

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .
RUN npm run build  # produces ./dist/

# ---- Runtime stage ----------------------------------------------------------
FROM gcr.io/distroless/nodejs20-debian12:nonroot
WORKDIR /app

# Bring in only what we need at runtime.
COPY --from=build --chown=nonroot:nonroot /src/node_modules ./node_modules
COPY --from=build --chown=nonroot:nonroot /src/dist ./dist
COPY --from=build --chown=nonroot:nonroot /src/package.json ./package.json

# Distroless nonroot UID/GID is 65532. We export 8080 by convention; the
# Helm chart's targetPort matches.
ENV NODE_ENV=production \
    MCP_LISTEN_ADDR=0.0.0.0:8080 \
    MCP_ENDPOINT_PATH=/mcp \
    OTEL_NODE_RESOURCE_DETECTORS=env,host,os,process,container

EXPOSE 8080
USER nonroot

# Distroless images have no shell, so use exec form.
CMD ["dist/server.js"]
