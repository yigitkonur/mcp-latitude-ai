# HTTP Transport Missing Health Check Endpoint

**Severity:** MEDIUM | **Category:** stability | **Component:** http-transport | **Batch:** 1

## 🔍 Finding

The HTTP transport has a basic root endpoint returning "server is running" text, but no proper health check endpoint for load balancers or container orchestration.

**Why this matters:** Container orchestrators (K8s, Docker) and load balancers need health endpoints for proper routing.

**Context:** Only affects HTTP transport mode.

## 📂 Files

- `src/index.ts:115-118` — Basic root endpoint, not a proper health check

## 💻 Code

```typescript
// src/index.ts:115-118
app.get('/', (_req: Request, res: Response) => {
    res.send(`Latitude MCP Server v${VERSION} is running`);
});
// Not a proper health endpoint - no JSON, no status checks
```

## 📊 Analysis

**Current:** Root endpoint returns text string. No /health or /ready endpoints.

**Assessment:** Per 12-factor and K8s best practices:
- `/health` or `/healthz` for liveness
- `/ready` for readiness
- Return JSON with status
- Check dependencies (optional)

**Recommendation:** Add proper health endpoint.

## 🎯 Action

**Priority:** This Sprint (if deploying to containers)

**Fix:**
```typescript
// Add health endpoints
app.get('/health', (_req: Request, res: Response) => {
    res.json({
        status: 'healthy',
        version: VERSION,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});

app.get('/ready', async (_req: Request, res: Response) => {
    // Could add API connectivity check here
    try {
        // Quick connectivity test if needed
        res.json({ status: 'ready' });
    } catch {
        res.status(503).json({ status: 'not_ready' });
    }
});
```

## 💼 Impact

- **Stability:** Container orchestration issues
- **Performance:** N/A
- **Scalability:** Load balancer routing issues

## 🔗 Evidence

- MCP Best Practices: "Provide /health and /ready endpoints"
- K8s: Requires liveness/readiness probes

## 🔄 Correlation

Part of HTTP transport improvements
