# API Calls Have No Request Timeout

**Severity:** CRITICAL | **Category:** stability | **Component:** services | **Batch:** 4

## 🔍 Finding

The `fetchLatitudeApi()` function uses native `fetch()` without any timeout configuration. If the Latitude API becomes slow or unresponsive, requests will hang indefinitely, blocking the MCP server and potentially causing cascading failures.

**Why this matters:** An unresponsive external API can cause the entire MCP server to hang, making it unusable. This is a production blocker.

**Context:** This affects all 16 Latitude tools and 4 resources that make API calls.

## 📂 Files

- `src/services/vendor.latitude.service.ts:88` — `fetch(url, requestOptions)` with no timeout
- `src/services/vendor.latitude.service.ts:188` — Streaming fetch also has no timeout

## 💻 Code

```typescript
// src/services/vendor.latitude.service.ts:87-89
try {
    const response = await fetch(url, requestOptions);  // No timeout!
    const endTime = performance.now();
```

## 📊 Analysis

**Current:** Native fetch() is called without AbortController timeout. If Latitude API hangs, the request hangs forever.

**Assessment:** Per MCP best practices research, recommended timeouts are:
- Connect timeout: 5 seconds
- Response timeout: 15-30 seconds
- Tool execution: 30-60 seconds max

**Recommendation:** Add AbortController with configurable timeout.

**Reference:** [MCP Best Practices - Timeout Configurations](https://modelcontextprotocol.info/docs/best-practices/)

## 🎯 Action

**Priority:** Immediate (before production use)

**Fix:**
```typescript
// Add to fetchLatitudeApi
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s default

const requestOptions: RequestInit = {
    method: options.method || 'GET',
    headers: { ... },
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: controller.signal,
};

try {
    const response = await fetch(url, requestOptions);
    clearTimeout(timeoutId);
    // ... rest of code
} catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
        throw createApiError('Request timeout', 504, error);
    }
    // ... existing error handling
}
```

**Verify:** Run a tool call and simulate slow network; should timeout after 30s.

## 💼 Impact

- **Stability:** Server can hang indefinitely on slow API
- **Performance:** No upper bound on request duration
- **Scalability:** Blocked requests consume resources

## 🔗 Evidence

- MCP Best Practices: "Enforce per-layer timeouts; propagate deadlines; abort with 504 on overrun"
- Recommended: Connect 5s, Response 15s, Tool exec 30s

## 🔄 Correlation

Related to 02-CRITICAL (no retry logic) - both affect API resilience
