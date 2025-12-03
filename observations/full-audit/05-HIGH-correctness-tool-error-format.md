# Tool Error Responses Missing isError Flag

**Severity:** HIGH | **Category:** correctness | **Component:** tools | **Batch:** 2

## 🔍 Finding

Tool error responses return `{ content: [{ type: 'text', text: 'Error: ...' }] }` but don't set `isError: true`. MCP SDK expects error responses to include this flag so clients/LLMs can distinguish errors from successful text responses.

**Why this matters:** LLMs may not recognize tool failures as errors, potentially continuing with invalid data or retrying incorrectly.

**Context:** Affects all 19 tools when they encounter errors.

## 📂 Files

- `src/utils/error.util.ts:129-166` — `formatErrorForMcpTool` function
- `src/tools/latitude.tool.ts:240-243` — Example error handling in tool

## 💻 Code

```typescript
// src/utils/error.util.ts:153-165
return {
    content: [
        {
            type: 'text' as const,
            text: `Error: ${mcpError.message}`,
        },
    ],
    metadata: {  // metadata is not standard MCP field
        errorType: mcpError.type,
        statusCode: mcpError.statusCode,
        errorDetails,
    },
};
// Missing: isError: true
```

## 📊 Analysis

**Current:** Error responses use same format as success, just with "Error:" prefix in text. The `metadata` field is non-standard.

**Assessment:** Per MCP SDK and best practices:
- Tool errors should return `{ isError: true, content: [...] }`
- Structured error info should be in the content, not metadata
- Error codes should be machine-readable

**Recommendation:** Add `isError: true` to error responses.

**Reference:** [MCP SDK Tool Response Format](https://modelcontextprotocol.io/docs/develop/build-server)

## 🎯 Action

**Priority:** This Sprint

**Fix:**
```typescript
// src/utils/error.util.ts - formatErrorForMcpTool
return {
    isError: true,  // Add this flag!
    content: [
        {
            type: 'text' as const,
            text: JSON.stringify({
                error: mcpError.message,
                code: mcpError.type,
                statusCode: mcpError.statusCode,
                retryable: [429, 502, 503, 504].includes(mcpError.statusCode || 0),
            }),
        },
    ],
};
```

**Verify:** Trigger a tool error; check response includes `isError: true`.

## 💼 Impact

- **Stability:** LLMs may not recognize failures
- **Performance:** May retry non-retryable errors
- **Scalability:** N/A

## 🔗 Evidence

- MCP SDK: Tool handlers can return `{ isError: true }` to signal errors
- Best practice: Include error code and retryable flag

## 🔄 Correlation

Standalone finding, but affects all tool error paths
