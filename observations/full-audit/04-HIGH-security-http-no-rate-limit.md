# HTTP Transport Has No Rate Limiting

**Severity:** HIGH | **Category:** security | **Component:** http-transport | **Batch:** 1

## 🔍 Finding

The HTTP transport has no rate limiting, making it vulnerable to denial-of-service attacks. An attacker could flood the `/mcp` endpoint with requests, exhausting server resources and potentially hitting Latitude API rate limits.

**Why this matters:** Without rate limiting, a single malicious client can overwhelm the server or burn through API quota.

**Context:** Only affects HTTP transport mode (`TRANSPORT_MODE=http`).

## 📂 Files

- `src/index.ts:80-133` — HTTP setup with no rate limiting

## 💻 Code

```typescript
// src/index.ts:101-113 - No rate limiting on endpoint
app.all(mcpEndpoint, (req: Request, res: Response) => {
    transport
        .handleRequest(req, res, req.body)
        .catch((err: unknown) => {
            // ... error handling
        });
});
```

## 📊 Analysis

**Current:** All requests processed without throttling. No per-client limits.

**Assessment:** Per MCP best practices:
- Token-bucket rate limiting (e.g., 100 req/s burst 20)
- Per-IP or per-client tracking
- Return 429 with Retry-After header when exceeded

**Recommendation:** Add express-rate-limit middleware.

**Reference:** [MCP Best Practices](https://modelcontextprotocol.info/docs/best-practices/)

## 🎯 Action

**Priority:** This Sprint (if using HTTP transport in production)

**Fix:**
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute per IP
    message: {
        error: 'Too many requests',
        retry_after: 60
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(mcpEndpoint, limiter);
```

**Install:** `npm install express-rate-limit`

**Verify:** Send 101 requests in 1 minute; 101st should receive 429.

## 💼 Impact

- **Security:** DoS vulnerability
- **Stability:** Can exhaust server resources
- **Scalability:** Can burn through API quota

## 🔗 Evidence

- MCP Best Practices: "Token-bucket rate limiter (rate=100/s, burst=20)"
- "Return 429 with Retry-After header when exceeded"

## 🔄 Correlation

Related to 03-CRITICAL (permissive CORS) - HTTP security bundle
