# API Calls Have No Retry Logic

**Severity:** CRITICAL | **Category:** stability | **Component:** services | **Batch:** 4

## 🔍 Finding

The `fetchLatitudeApi()` function has no retry logic for transient errors. When Latitude API returns 429 (rate limit), 502, 503, or 504 errors, the request fails immediately without retry. This makes the server fragile to temporary API issues.

**Why this matters:** Transient failures are common in production. Without retry logic, temporary API hiccups cause tool failures that could be easily recovered.

**Context:** All Latitude API operations fail on first transient error.

## 📂 Files

- `src/services/vendor.latitude.service.ts:61-171` — `fetchLatitudeApi` function with no retry
- `src/utils/error.util.ts` — Has error types but no retry-after handling

## 💻 Code

```typescript
// src/services/vendor.latitude.service.ts:96-141
if (!response.ok) {
    // Errors are thrown immediately, no retry attempted
    if (response.status === 401) {
        throw createAuthInvalidError(...);
    } else if (response.status === 403) {
        throw createAuthInvalidError(...);
    }
    // ... throws immediately on 429, 502, 503, 504 too
}
```

## 📊 Analysis

**Current:** All errors thrown immediately. No distinction between retryable (429, 502, 503, 504) and non-retryable (400, 401, 403, 404) errors.

**Assessment:** Per MCP security best practices:
- Transient errors (429, 502, 503, 504): Exponential backoff with jitter
- Respect `Retry-After` header when present
- Non-retryable (400, 401, 403): Fail fast
- Max 3 retries for idempotent operations

**Recommendation:** Add retry wrapper with exponential backoff for transient errors.

**Reference:** [MCP Security Best Practices](https://www.legitsecurity.com/aspm-knowledge-base/model-context-protocol-security)

## 🎯 Action

**Priority:** Immediate

**Fix:**
```typescript
const RETRY_STATUS_CODES = [429, 502, 503, 504];
const MAX_RETRIES = 3;

async function fetchWithRetry<T>(
    endpoint: string,
    options: RequestOptions = {},
    attempt = 1
): Promise<T> {
    try {
        return await fetchLatitudeApi<T>(endpoint, options);
    } catch (error) {
        if (error instanceof McpError && 
            error.statusCode && 
            RETRY_STATUS_CODES.includes(error.statusCode) &&
            attempt < MAX_RETRIES) {
            
            // Exponential backoff with jitter
            const delay = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
            const jitter = delay * 0.25 * Math.random();
            await new Promise(r => setTimeout(r, delay + jitter));
            
            methodLogger.warn(`Retrying after ${error.statusCode}, attempt ${attempt + 1}`);
            return fetchWithRetry(endpoint, options, attempt + 1);
        }
        throw error;
    }
}
```

**Verify:** Simulate 503 response; verify retry with backoff before failure.

## 💼 Impact

- **Stability:** Temporary API issues cause immediate failures
- **Performance:** No automatic recovery from transient errors
- **Scalability:** Cascading failures during API degradation

## 🔗 Evidence

- MCP Best Practices: "Exponential backoff with jitter: base=200ms, max=8s, jitter=±25%"
- "Retry up to 3 times for idempotent operations"

## 🔄 Correlation

Related to 01-CRITICAL (no timeout) - both affect API resilience
Should consider circuit breaker pattern for repeated failures
