# No Request/Correlation ID Propagation

**Severity:** MEDIUM | **Category:** maintainability | **Component:** shared | **Batch:** 5

## 🔍 Finding

Logs include session ID but not per-request correlation IDs. When debugging issues, it's difficult to trace a single request through the system.

**Why this matters:** Production debugging requires tracing individual requests across log entries.

**Context:** Logger has method context but no request-level correlation.

## 📂 Files

- `src/utils/logger.util.ts` — Session ID but no request ID
- `src/controllers/latitude.controller.ts` — No request ID passed through

## 💻 Code

```typescript
// src/utils/logger.util.ts:120
const SESSION_ID = crypto.randomUUID();  // Session-level only

// No per-request ID generated or propagated
```

## 📊 Analysis

**Current:** Session ID used for all logs. Individual requests not traceable.

**Assessment:** Per logging best practices:
- Generate UUID per request
- Propagate via X-Request-ID header (HTTP) or context (stdio)
- Include in all log entries
- Pass to downstream API calls

**Recommendation:** Add request ID generation and propagation.

## 🎯 Action

**Priority:** Next Sprint

**Fix concept:**
```typescript
// For HTTP transport, middleware to generate/extract request ID
app.use((req, res, next) => {
    req.requestId = req.headers['x-request-id'] || crypto.randomUUID();
    res.setHeader('x-request-id', req.requestId);
    next();
});

// Pass through context to logger
methodLogger.info('Processing request', { requestId: req.requestId });
```

## 💼 Impact

- **Stability:** Debugging harder
- **Performance:** N/A
- **Scalability:** N/A

## 🔗 Evidence

- MCP Best Practices: "Propagate X-Request-ID; include in all logs"

## 🔄 Correlation

Works with logging improvements
