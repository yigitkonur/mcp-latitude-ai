# No Circuit Breaker for External API Calls

**Severity:** HIGH | **Category:** stability | **Component:** services | **Batch:** 4

## 🔍 Finding

The Latitude API service has no circuit breaker pattern. If the Latitude API becomes consistently failing, every tool call will attempt the failing API, wasting resources and delaying error responses.

**Why this matters:** Cascading failures can make the entire MCP server unusable during API outages.

**Context:** Affects all operations that call Latitude API.

## 📂 Files

- `src/services/vendor.latitude.service.ts` — No circuit breaker implementation

## 💻 Code

```typescript
// All API calls go directly to fetchLatitudeApi
// No tracking of failure state or circuit breaker logic
async function listProjects(): Promise<Project[]> {
    const data = await fetchLatitudeApi<unknown>('/projects');
    return ProjectListSchema.parse(data);
}
```

## 📊 Analysis

**Current:** Every request attempts the API regardless of recent failure history.

**Assessment:** Per MCP best practices:
- Circuit breaker opens after N consecutive failures (e.g., 5)
- In open state, fail fast for recovery_timeout period (e.g., 30s)
- Half-open state allows single test request
- Prevents cascading failures and allows API recovery

**Recommendation:** Implement simple circuit breaker for API calls.

**Reference:** [MCP Best Practices - Error Handling](https://modelcontextprotocol.info/docs/best-practices/)

## 🎯 Action

**Priority:** This Sprint

**Fix:** Add simple circuit breaker:
```typescript
// src/services/circuit-breaker.ts
class CircuitBreaker {
    private failures = 0;
    private lastFailure = 0;
    private state: 'closed' | 'open' | 'half-open' = 'closed';
    
    constructor(
        private threshold = 5,
        private recoveryTime = 30000
    ) {}
    
    async call<T>(fn: () => Promise<T>): Promise<T> {
        if (this.state === 'open') {
            if (Date.now() - this.lastFailure > this.recoveryTime) {
                this.state = 'half-open';
            } else {
                throw createApiError('Service temporarily unavailable', 503);
            }
        }
        
        try {
            const result = await fn();
            this.reset();
            return result;
        } catch (error) {
            this.recordFailure();
            throw error;
        }
    }
    
    private recordFailure() {
        this.failures++;
        this.lastFailure = Date.now();
        if (this.failures >= this.threshold) {
            this.state = 'open';
        }
    }
    
    private reset() {
        this.failures = 0;
        this.state = 'closed';
    }
}

export const apiCircuitBreaker = new CircuitBreaker();
```

**Verify:** Simulate 5 consecutive API failures; 6th call should fail fast with 503.

## 💼 Impact

- **Stability:** Cascading failures during outages
- **Performance:** Wasted time on failing requests
- **Scalability:** Resource exhaustion during incidents

## 🔗 Evidence

- MCP Best Practices: "CircuitBreaker(failure_threshold=5, recovery_timeout=30)"
- Pattern prevents cascading failures to downstream services

## 🔄 Correlation

Works with 01-CRITICAL (timeout) and 02-CRITICAL (retry) for complete resilience
