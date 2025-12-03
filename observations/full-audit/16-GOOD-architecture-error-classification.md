# Good Error Classification System

**Severity:** GOOD | **Category:** architecture | **Component:** utils | **Batch:** 5

## 🔍 Finding

The codebase has a well-structured error classification system with typed errors (AUTH_MISSING, AUTH_INVALID, API_ERROR, UNEXPECTED_ERROR) and consistent error handling patterns.

**Why this is good:** Typed errors enable proper error handling and user-friendly messages.

**Context:** Error utilities used throughout controllers and tools.

## 📂 Files

- `src/utils/error.util.ts` — Core error types and formatters
- `src/utils/error-handler.util.ts` — Controller error handling

## 💻 Code

```typescript
// src/utils/error.util.ts:6-11 - Clear error types
export enum ErrorType {
    AUTH_MISSING = 'AUTH_MISSING',
    AUTH_INVALID = 'AUTH_INVALID',
    API_ERROR = 'API_ERROR',
    UNEXPECTED_ERROR = 'UNEXPECTED_ERROR',
}

// src/utils/error.util.ts:16-33 - Custom error class
export class McpError extends Error {
    type: ErrorType;
    statusCode?: number;
    originalError?: unknown;
}

// Factory functions for consistent creation
export function createApiError(message, statusCode, originalError): McpError {...}
```

## 📊 Analysis

**What's Good:**
1. **Enum-based classification** - Clear error categories
2. **Custom error class** - Carries type, status code, and original error
3. **Factory functions** - Consistent error creation
4. **Original error preservation** - Stack traces preserved
5. **Error context** - buildErrorContext for rich debugging info
6. **CLI-specific handling** - Different formatting for CLI vs MCP

**Pattern to replicate:**
```typescript
// Catch and classify
try {
    await apiCall();
} catch (error) {
    throw handleControllerError(
        error,
        buildErrorContext('Latitude', 'operation', 'file@method', entityId)
    );
}
```

## 🎯 Action

**Priority:** Replicate this pattern

**Enhancement opportunity:** Add `retryable` flag to McpError for retry logic.

## 💼 Impact

- **Stability:** Consistent error handling
- **Performance:** N/A
- **Scalability:** Easy to add new error types

## 🔗 Evidence

- MCP Best Practices: "Structured error object with code, message, details"
- Current implementation is close to best practice

## 🔄 Correlation

Connects to 05-HIGH (isError flag) for complete error story
