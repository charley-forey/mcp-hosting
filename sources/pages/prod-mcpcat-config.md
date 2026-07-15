---
slug: prod-mcpcat-config
url: https://mcpcat.io/guides/configuring-mcp-installations-production
title: Configure MCP Servers for Production - Best Practices | MCPcat
author: MCPcat Team
fetched_at: 2026-04-30T20:52:48Z
sha256: c1299122954c46b82c6b1c0371206556826299db69c2c8a3ffd9815e88849ce1
license: blog-fair-use
tier: 4
---
- Configure MCP Servers for Production - Best Practices | MCPcat[/guides/](/guides/)
## Configuring MCP installations for production deployments
Kashish HoraCo-founder of MCPcat[Try out MCPcat](https://mcpcat.io/app)[MCP Dev Quickstart](/guides/topic/mcp-dev-quickstart/)
## The Quick Answer

Deploy MCP servers in production with environment-specific configuration, TLS encryption, and proper authentication:

```
{
 "mcpServers": {
 "production-server": {
 "command": "node",
 "args": ["/opt/mcp/server.js"],
 "env": {
 "NODE_ENV": "production",
 "API_KEY": "${VAULT_API_KEY}",
 "TLS_CERT": "/etc/ssl/certs/mcp.crt",
 "LOG_LEVEL": "info"
 }
 }
 }
}
```

This configuration ensures secure authentication, encrypted transport, and proper logging. Replace `${VAULT_API_KEY}` with your secret management solution.

## Prerequisites

Node.js 18+ or Python 3.10+ runtime environment

- TLS certificates for encrypted communication

- Secret management solution (HashiCorp Vault, AWS Secrets Manager, or similar)

- Container runtime (Docker) or orchestration platform (Kubernetes) for scaling

- Monitoring stack (Prometheus, Grafana, ELK) for observability

## Environment Configuration

Production MCP servers require careful environment variable management to ensure security and maintainability. Store sensitive credentials in dedicated secret management tools and use environment-specific configurations.

Configure your production environment variables through your secret management system. Never commit sensitive values to version control:

```
# Set production environment variables$export NODE_ENV=production$export MCP_API_KEY=$(vault kv get -field=api_key secret/mcp)$export MCP_TLS_CERT=/etc/ssl/certs/mcp.crt$export MCP_TLS_KEY=/etc/ssl/private/mcp.key$export MCP_LOG_LEVEL=info$export MCP_MAX_CONNECTIONS=100$export MCP_TIMEOUT_MS=30000
```

For containerized deployments, mount secrets as volumes or use your orchestrator's secret management:

```
apiVersion: v1
kind: Secret
metadata:
 name: mcp-secrets
type: Opaque
data:
 api-key: -encoded-key>
 tls-cert: -encoded-cert>
 tls-key: -encoded-key>
```

The production configuration should include resource limits, health checks, and proper isolation. Use absolute paths for all file references to avoid ambiguity in different deployment environments.

## Security Configuration

Implementing robust security is critical for production MCP deployments. Configure authentication, authorization, and transport security to protect against common vulnerabilities.

### Authentication Setup

Configure strong authentication using OAuth 2.0 with PKCE or mTLS:

```
// server-config.ts
export const securityConfig = {
 authentication: {
 type: 'oauth2-pkce',
 issuer: 'https://auth.example.com',
 clientId: process.env.OAUTH_CLIENT_ID,
 requiredScopes: ['mcp:read', 'mcp:write'],
 tokenValidation: {
 audience: 'https://mcp.example.com',
 algorithms: ['RS256'],
 clockTolerance: 30
 }
 },
 mfa: {
 required: true,
 methods: ['totp', 'webauthn']
 }
}
```

For mTLS authentication, configure certificate validation:

```
// mtls-config.js
const tls = require('tls');
const fs = require('fs');

const tlsOptions = {
 cert: fs.readFileSync(process.env.MCP_TLS_CERT),
 key: fs.readFileSync(process.env.MCP_TLS_KEY),
 ca: fs.readFileSync(process.env.MCP_CA_CERT),
 requestCert: true,
 rejectUnauthorized: true,
 checkServerIdentity: (hostname, cert) => {
 // Custom validation logic
 if (!cert.subject.CN.includes('mcp-client')) {
 return new Error('Invalid client certificate');
 }
 }
};
```

Authentication must reject any tokens not explicitly issued for your MCP server. This prevents token passthrough attacks and maintains clear security boundaries.

### Transport Security

Enable TLS 1.3 with strong cipher suites for all connections. For Docker deployments, see our guide on [configuring MCP transport protocols for Docker containers](/guides/configuring-mcp-transport-docker):

```
{
 "transport": {
 "type": "https",
 "tls": {
 "minVersion": "TLSv1.3",
 "ciphers": [
 "TLS_AES_256_GCM_SHA384",
 "TLS_CHACHA20_POLY1305_SHA256",
 "TLS_AES_128_GCM_SHA256"
 ],
 "certificatePinning": {
 "enabled": true,
 "pins": ["sha256//YourCertificatePin"]
 }
 }
 }
}
```

Rotate certificates every 90 days and implement certificate pinning for additional security. Monitor certificate expiration and automate renewal processes.

### Access Control

Implement fine-grained access control with role-based permissions:

```
// authorization.ts
interface MCPPermission {
 resource: string;
 actions: string[];
 conditions?: Recordstring, any>;
}

const rolePermissions: Recordstring, MCPPermission[]> = {
 'mcp-admin': [
 { resource: '*', actions: ['*'] }
 ],
 'mcp-user': [
 { 
 resource: 'tools/*', 
 actions: ['read', 'execute'],
 conditions: { 
 rateLimit: 1000,
 timeWindow: '1h' 
 }
 }
 ],
 'mcp-readonly': [
 { resource: 'tools/*', actions: ['read'] }
 ]
};

// Validate permissions for each request
export function authorize(token: JWT, resource: string, action: string): boolean {
 const userRoles = token.claims.roles || [];
 // ... validation logic ...
}
```

Each tool invocation should validate permissions against the user's role and enforce rate limits to prevent abuse.

## Performance Optimization

MCP servers can handle over 5,000 context operations per second with proper optimization. Configure caching, connection pooling, and resource limits for optimal performance. For scalable deployments using StreamableHTTP, see our [guide on setting up StreamableHTTP](/guides/setting-up-streamablehttp-scalable-deployments).

### Caching Configuration

Implement distributed caching to reduce redundant operations:

```
// cache-config.js
const Redis = require('ioredis');

const cacheConfig = {
 redis: {
 cluster: [
 { host: 'redis-1.prod', port: 6379 },
 { host: 'redis-2.prod', port: 6379 },
 { host: 'redis-3.prod', port: 6379 }
 ],
 options: {
 enableReadyCheck: true,
 maxRetriesPerRequest: 3,
 retryStrategy: (times) => Math.min(times * 50, 2000)
 }
 },
 ttl: {
 contextData: 3600, // 1 hour
 toolResults: 300, // 5 minutes
 sessionData: 86400 // 24 hours
 },
 evictionPolicy: 'lru',
 maxMemory: '2gb'
};
```

Configure cache warming for frequently accessed data and implement cache invalidation strategies for data consistency.

### Connection Pooling

Optimize database and API connections with proper pooling:

```
// connection-pool.ts
interface PoolConfig {
 min: number;
 max: number;
 acquireTimeout: number;
 idleTimeout: number;
 validation: boolean;
}

const poolConfigs: Recordstring, PoolConfig> = {
 database: {
 min: 10,
 max: 100,
 acquireTimeout: 30000,
 idleTimeout: 60000,
 validation: true
 },
 httpClients: {
 min: 5,
 max: 50,
 acquireTimeout: 10000,
 idleTimeout: 120000,
 validation: false
 }
};

// Monitor pool health
setInterval(() => {
 const metrics = {
 active: pool.numUsed(),
 idle: pool.numFree(),
 pending: pool.numPendingAcquires()
 };
 prometheus.gauge('mcp_pool_connections', metrics);
}, 10000);
```

Connection pools prevent resource exhaustion and improve response times under load. Monitor pool utilization and adjust sizes based on traffic patterns.

### Resource Limits

Set appropriate resource limits to prevent system overload:

```
# kubernetes-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
 name: mcp-server
spec:
 template:
 spec:
 containers:
 - name: mcp
 resources:
 requests:
 memory: "512Mi"
 cpu: "500m"
 limits:
 memory: "2Gi"
 cpu: "2000m"
 env:
 - name: NODE_OPTIONS
 value: "--max-old-space-size=1536"
 - name: MCP_MAX_CONCURRENT_REQUESTS
 value: "100"
 - name: MCP_REQUEST_TIMEOUT_MS
 value: "30000"
```

Configure horizontal pod autoscaling based on CPU, memory, and custom metrics like request queue depth.

## Monitoring and Logging

Comprehensive monitoring ensures production reliability. Configure metrics collection, centralized logging, and alerting for all MCP components. For implementing health checks, see our [guide on connection health checks and monitoring](/guides/implementing-connection-health-checks).

### Metrics Collection

Configure Prometheus metrics for key performance indicators:

```
// metrics.ts
import { Registry, Counter, Histogram, Gauge } from 'prom-client';

const registry = new Registry();

// Request metrics
const requestCounter = new Counter({
 name: 'mcp_requests_total',
 help: 'Total MCP requests',
 labelNames: ['method', 'status', 'tool'],
 registers: [registry]
});

const requestDuration = new Histogram({
 name: 'mcp_request_duration_seconds',
 help: 'MCP request duration',
 labelNames: ['method', 'tool'],
 buckets: [0.1, 0.5, 1, 2, 5, 10],
 registers: [registry]
});

// Connection metrics
const activeConnections = new Gauge({
 name: 'mcp_active_connections',
 help: 'Number of active MCP connections',
 registers: [registry]
});

// Tool-specific metrics
const toolExecutions = new Counter({
 name: 'mcp_tool_executions_total',
 help: 'Tool execution count',
 labelNames: ['tool', 'status'],
 registers: [registry]
});
```

Export metrics for Prometheus scraping and create Grafana dashboards for visualization.

### Centralized Logging

Configure structured logging with appropriate levels:

```
// logging.js
const winston = require('winston');
const { ElasticsearchTransport } = require('winston-elasticsearch');

const logger = winston.createLogger({
 level: process.env.LOG_LEVEL || 'info',
 format: winston.format.combine(
 winston.format.timestamp(),
 winston.format.errors({ stack: true }),
 winston.format.json()
 ),
 defaultMeta: {
 service: 'mcp-server',
 environment: process.env.NODE_ENV,
 version: process.env.APP_VERSION
 },
 transports: [
 new ElasticsearchTransport({
 level: 'info',
 clientOpts: {
 node: process.env.ELASTICSEARCH_URL,
 auth: {
 apiKey: process.env.ELASTICSEARCH_API_KEY
 }
 },
 index: 'mcp-logs',
 dataStream: true
 })
 ]
});

// Log all MCP events
logger.info('MCP request received', {
 requestId: uuid(),
 method: request.method,
 tool: request.tool,
 userId: request.userId,
 timestamp: Date.now()
});
```

Ensure logs are tamper-evident and retain them according to compliance requirements. Never log sensitive data like tokens or passwords.

### Health Checks

Implement comprehensive health checks for orchestration systems:

```
// health.ts
interface HealthStatus {
 status: 'healthy' | 'degraded' | 'unhealthy';
 checks: Recordstring, CheckResult>;
 timestamp: number;
}

app.get('/health', async (req, res) => {
 const checks = await Promise.allSettled([
 checkDatabase(),
 checkCache(),
 checkExternalAPIs(),
 checkDiskSpace(),
 checkMemoryUsage()
 ]);
 
 const status: HealthStatus = {
 status: 'healthy',
 checks: {},
 timestamp: Date.now()
 };
 
 // Evaluate each check
 checks.forEach((result, index) => {
 const checkName = ['database', 'cache', 'apis', 'disk', 'memory'][index];
 if (result.status === 'rejected') {
 status.status = 'unhealthy';
 status.checks[checkName] = { 
 status: 'fail', 
 error: result.reason 
 };
 } else {
 status.checks[checkName] = result.value;
 }
 });
 
 const httpStatus = status.status === 'healthy' ? 200 : 503;
 res.status(httpStatus).json(status);
});
```

Configure liveness and readiness probes for Kubernetes deployments to ensure automatic recovery from failures.

## Deployment Strategies

Production deployments require careful planning for zero-downtime updates and disaster recovery. Use containerization and orchestration for consistency and scalability.

### Docker Configuration

Create optimized Docker images for production:

```
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine
RUN apk add --no-cache tini
RUN addgroup -g 1001 -S mcp && adduser -S mcp -u 1001

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --chown=mcp:mcp . .

USER mcp
EXPOSE 8080

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]
```

Build multi-stage images to minimize attack surface and use distroless base images when possible.

### Kubernetes Deployment

Deploy with high availability and auto-scaling:

```
# mcp-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
 name: mcp-server
 labels:
 app: mcp-server
spec:
 replicas: 3
 strategy:
 type: RollingUpdate
 rollingUpdate:
 maxSurge: 1
 maxUnavailable: 0
 selector:
 matchLabels:
 app: mcp-server
 template:
 metadata:
 labels:
 app: mcp-server
 spec:
 affinity:
 podAntiAffinity:
 requiredDuringSchedulingIgnoredDuringExecution:
 - labelSelector:
 matchLabels:
 app: mcp-server
 topologyKey: kubernetes.io/hostname
 containers:
 - name: mcp
 image: gcr.io/project/mcp-server:v1.2.3
 ports:
 - containerPort: 8080
 name: http
 env:
 - name: NODE_ENV
 value: production
 envFrom:
 - secretRef:
 name: mcp-secrets
 - configMapRef:
 name: mcp-config
 livenessProbe:
 httpGet:
 path: /health
 port: 8080
 initialDelaySeconds: 30
 periodSeconds: 10
 readinessProbe:
 httpGet:
 path: /ready
 port: 8080
 initialDelaySeconds: 5
 periodSeconds: 5
 resources:
 requests:
 memory: "512Mi"
 cpu: "500m"
 limits:
 memory: "2Gi"
 cpu: "2000m"
 securityContext:
 runAsNonRoot: true
 runAsUser: 1001
 fsGroup: 1001
```

Configure pod disruption budgets to maintain availability during cluster maintenance.

### Auto-scaling Configuration

Enable horizontal pod autoscaling based on metrics:

```
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
 name: mcp-server-hpa
spec:
 scaleTargetRef:
 apiVersion: apps/v1
 kind: Deployment
 name: mcp-server
 minReplicas: 3
 maxReplicas: 20
 metrics:
 - type: Resource
 resource:
 name: cpu
 target:
 type: Utilization
 averageUtilization: 70
 - type: Resource
 resource:
 name: memory
 target:
 type: Utilization
 averageUtilization: 80
 - type: Pods
 pods:
 metric:
 name: mcp_request_rate
 target:
 type: AverageValue
 averageValue: "1000"
 behavior:
 scaleDown:
 stabilizationWindowSeconds: 300
 policies:
 - type: Percent
 value: 10
 periodSeconds: 60
 scaleUp:
 stabilizationWindowSeconds: 60
 policies:
 - type: Percent
 value: 100
 periodSeconds: 30
```

Monitor scaling events and adjust thresholds based on observed traffic patterns and response times.

## Common Issues

### Error: Connection refused to MCP server

This typically occurs when TLS configuration mismatches between client and server. The root cause is often certificate validation failures or incorrect cipher suite configuration.

```
# Debug TLS connection issues$openssl s_client -connect mcp.example.com:8443 \$ -cert client.crt \$ -key client.key \$ -CAfile ca.crt \$ -tls1_3 # Check certificate validity$openssl x509 -in server.crt -text -noout | grep -A2 "Validity"
```

Ensure certificates are valid, properly signed by your CA, and include the correct Subject Alternative Names. Prevent this by automating certificate renewal 30 days before expiration.

### Error: MCP request timeout after 30s

Request timeouts indicate either server overload or inefficient tool implementations. Check your connection pool utilization and database query performance. For detailed timeout troubleshooting, see our [guide on fixing request timeout errors](/guides/fixing-mcp-error-32001-request-timeout).

```
// Add request tracing
app.use((req, res, next) => {
 const start = Date.now();
 const requestId = uuid();
 
 req.id = requestId;
 req.timing = { start };
 
 // Log slow requests
 res.on('finish', () => {
 const duration = Date.now() - start;
 if (duration > 10000) {
 logger.warn('Slow request detected', {
 requestId,
 duration,
 path: req.path,
 method: req.method
 });
 }
 });
 
 next();
});
```

Implement request timeouts at multiple levels and use circuit breakers to prevent cascading failures. Add caching for expensive operations.

### Error: Invalid token audience

Token audience validation failures occur when clients present tokens issued for different services. This security feature prevents token reuse attacks.

```
// Proper token validation
const jwt = require('jsonwebtoken');

function validateToken(token, expectedAudience) {
 try {
 const decoded = jwt.verify(token, publicKey, {
 algorithms: ['RS256'],
 audience: expectedAudience,
 issuer: process.env.TOKEN_ISSUER,
 clockTolerance: 30
 });
 
 // Additional validation
 if (!decoded.scope.includes('mcp:access')) {
 throw new Error('Missing required scope');
 }
 
 return decoded;
 } catch (error) {
 logger.error('Token validation failed', { 
 error: error.message,
 audience: expectedAudience 
 });
 throw error;
 }
}
```

Configure your OAuth provider to issue tokens with the correct audience claim. Document the expected token format for client developers.

## Examples

### Production PostgreSQL MCP Server

Deploy a PostgreSQL MCP server with connection pooling and monitoring:

```
// postgres-mcp-server.ts
import { MCPServer } from '@modelcontextprotocol/server';
import { Pool } from 'pg';
import { createMetricsMiddleware } from './metrics';
import { createAuthMiddleware } from './auth';

const pool = new Pool({
 host: process.env.DB_HOST,
 port: parseInt(process.env.DB_PORT || '5432'),
 database: process.env.DB_NAME,
 user: process.env.DB_USER,
 password: process.env.DB_PASSWORD,
 ssl: {
 rejectUnauthorized: true,
 ca: fs.readFileSync(process.env.DB_CA_CERT)
 },
 max: 20, // Maximum pool size
 idleTimeoutMillis: 30000, // Close idle clients after 30s
 connectionTimeoutMillis: 10000,
 statement_timeout: 30000,
 query_timeout: 30000
});

const server = new MCPServer({
 name: 'postgres-prod',
 version: '1.0.0',
 middleware: [
 createAuthMiddleware({ 
 requiredScopes: ['db:read', 'db:write'] 
 }),
 createMetricsMiddleware({ 
 registry: prometheusRegistry 
 })
 ]
});

server.tool('query', {
 description: 'Execute PostgreSQL query',
 parameters: {
 sql: { type: 'string', required: true },
 params: { type: 'array', required: false }
 },
 handler: async ({ sql, params = [] }) => {
 const start = Date.now();
 try {
 // Validate query
 if (sql.match(/^\s*(drop|truncate|delete|update|insert)/i)) {
 const hasWriteScope = request.token.scope.includes('db:write');
 if (!hasWriteScope) {
 throw new Error('Write operations require db:write scope');
 }
 }
 
 const result = await pool.query(sql, params);
 
 metrics.recordQuery({
 duration: Date.now() - start,
 rows: result.rowCount,
 command: result.command
 });
 
 return {
 rows: result.rows,
 rowCount: result.rowCount,
 command: result.command
 };
 } catch (error) {
 metrics.recordError('query', error);
 throw error;
 }
 }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
 logger.info('Shutting down MCP server');
 await server.close();
 await pool.end();
 process.exit(0);
});
```

This implementation includes connection pooling, query validation, metrics collection, and graceful shutdown handling. Production deployments would add query result caching, read replicas for scaling, and automated failover for high availability.

### Multi-Region MCP Gateway

Deploy a gateway that routes requests to region-specific MCP servers:

```
// mcp-gateway.ts
import express from 'express';
import httpProxy from 'http-proxy-middleware';
import { RateLimiterRedis } from 'rate-limiter-flexible';

const app = express();

// Region configuration
const regions = {
 'us-east': { 
 url: 'https://us-east.mcp.internal:8443',
 weight: 40 
 },
 'us-west': { 
 url: 'https://us-west.mcp.internal:8443',
 weight: 30 
 },
 'eu-west': { 
 url: 'https://eu-west.mcp.internal:8443',
 weight: 30 
 }
};

// Rate limiting per user
const rateLimiter = new RateLimiterRedis({
 storeClient: redisClient,
 keyPrefix: 'mcp_rl',
 points: 1000, // Number of requests
 duration: 3600, // Per hour
 blockDuration: 600 // Block for 10 minutes
});

// Weighted round-robin selection
let currentIndex = 0;
const regionList = Object.entries(regions).flatMap(([name, config]) => 
 Array(config.weight).fill(name)
);

function selectRegion(userLocation?: string): string {
 // Prefer user's region if available
 if (userLocation && regions[userLocation]) {
 return userLocation;
 }
 
 // Otherwise use weighted round-robin
 const region = regionList[currentIndex];
 currentIndex = (currentIndex + 1) % regionList.length;
 return region;
}

// Gateway middleware
app.use('/mcp', async (req, res, next) => {
 try {
 // Rate limiting
 const userId = req.user?.id || req.ip;
 await rateLimiter.consume(userId);
 
 // Select region
 const userRegion = req.headers['x-user-region'];
 const targetRegion = selectRegion(userRegion);
 const targetUrl = regions[targetRegion].url;
 
 // Add tracing headers
 req.headers['x-request-id'] = req.id;
 req.headers['x-gateway-region'] = process.env.REGION;
 req.headers['x-target-region'] = targetRegion;
 
 // Proxy request
 const proxy = httpProxy.createProxyMiddleware({
 target: targetUrl,
 changeOrigin: true,
 secure: true,
 timeout: 30000,
 proxyTimeout: 30000,
 onError: (err, req, res) => {
 logger.error('Proxy error', { 
 error: err.message,
 region: targetRegion,
 requestId: req.id 
 });
 
 // Fallback to another region
 const fallbackRegion = selectRegion();
 if (fallbackRegion !== targetRegion) {
 req.headers['x-fallback-region'] = fallbackRegion;
 proxy.web(req, res, { 
 target: regions[fallbackRegion].url 
 });
 } else {
 res.status(503).json({ 
 error: 'Service temporarily unavailable' 
 });
 }
 }
 });
 
 proxy(req, res, next);
 } catch (error) {
 if (error instanceof RateLimiterRes) {
 res.status(429).json({ 
 error: 'Rate limit exceeded',
 retryAfter: Math.round(error.msBeforeNext / 1000)
 });
 } else {
 next(error);
 }
 }
});

// Health check includes all regions
app.get('/health', async (req, res) => {
 const checks = await Promise.allSettled(
 Object.entries(regions).map(async ([name, config]) => {
 const response = await fetch(`${config.url}/health`);
 return { 
 region: name, 
 status: response.ok ? 'healthy' : 'unhealthy' 
 };
 })
 );
 
 const healthy = checks.every(r => 
 r.status === 'fulfilled' && r.value.status === 'healthy'
 );
 
 res.status(healthy ? 200 : 503).json({ 
 status: healthy ? 'healthy' : 'degraded',
 regions: checks.map(r => r.value)
 });
});
```

This gateway provides geographic load balancing, automatic failover, rate limiting, and comprehensive health monitoring. Production deployments would add request queuing, circuit breakers for each region, and integration with CDN services for static content caching.

### Kubernetes CronJob for MCP Maintenance

Automate certificate rotation and cleanup tasks:

```
# mcp-maintenance-cronjob.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
 name: mcp-maintenance
spec:
 schedule: "0 3 * * *" # Daily at 3 AM
 successfulJobsHistoryLimit: 3
 failedJobsHistoryLimit: 3
 jobTemplate:
 spec:
 template:
 spec:
 serviceAccountName: mcp-maintenance
 containers:
 - name: maintenance
 image: gcr.io/project/mcp-maintenance:v1.0.0
 command: ["/bin/sh"]
 args:
 - -c
 - |
 # Certificate rotation check
 echo "Checking certificate expiration..."
 days_remaining=$(openssl x509 -enddate -noout -in /certs/tls.crt | \
 cut -d= -f2 | xargs -I {} date -d {} +%s | \
 xargs -I {} expr {} - $(date +%s) | \
 xargs -I {} expr {} / 86400)
 
 if [ $days_remaining -lt 30 ]; then
 echo "Certificate expires in $days_remaining days, rotating..."
 kubectl create secret tls mcp-tls-new \
 --cert=/new-certs/tls.crt \
 --key=/new-certs/tls.key \
 --dry-run=client -o yaml | kubectl apply -f -
 
 kubectl patch deployment mcp-server -p \
 '{"spec":{"template":{"metadata":{"annotations":{"rotated":"'$(date +%s)'"}}}}}'
 fi
 
 # Clean up old sessions
 echo "Cleaning expired sessions..."
 kubectl exec -it deployment/mcp-server -- \
 node -e "require('./cleanup').cleanExpiredSessions()"
 
 # Compact cache storage
 echo "Compacting cache..."
 kubectl exec -it statefulset/redis-cluster -- \
 redis-cli --cluster call :6379 BGREWRITEAOF
 
 # Generate maintenance report
 echo "Generating report..."
 kubectl exec -it deployment/mcp-server -- \
 node -e "require('./reports').generateMaintenanceReport()" \
 > /reports/maintenance-$(date +%Y%m%d).json
 
 # Upload report to storage
 gsutil cp /reports/maintenance-*.json \
 gs://mcp-reports/maintenance/
 volumeMounts:
 - name: certs
 mountPath: /certs
 readOnly: true
 - name: new-certs
 mountPath: /new-certs
 readOnly: true
 - name: reports
 mountPath: /reports
 volumes:
 - name: certs
 secret:
 secretName: mcp-tls
 - name: new-certs
 secret:
 secretName: mcp-tls-renewal
 - name: reports
 emptyDir: {}
 restartPolicy: OnFailure
```

This maintenance job automates critical operational tasks including certificate rotation, session cleanup, and cache optimization. Production environments should monitor job execution and alert on failures.

#### Related Guides
[## Configuring MCP transport protocols for Docker containers
Configure MCP servers in Docker containers with proper transport protocols and networking.](/guides/configuring-mcp-transport-docker/)[## Setting up StreamableHTTP for scalable deployments
Deploy scalable MCP servers with StreamableHTTP for high performance and horizontal scaling.](/guides/setting-up-streamablehttp-scalable-deployments/)[## Implementing connection health checks and monitoring
Implement health checks and monitoring for MCP servers to ensure reliable production deployments.](/guides/implementing-connection-health-checks/)
#### Keep an eye on AI.
Get rich user analytics and tracing on every user interacting with your MCP server.[Get started](https://mcpcat.io/app)
