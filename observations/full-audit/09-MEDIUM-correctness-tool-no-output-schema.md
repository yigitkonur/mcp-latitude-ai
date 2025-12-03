# Tools Missing Output Schema Definition

**Severity:** MEDIUM | **Category:** correctness | **Component:** tools | **Batch:** 2

## 🔍 Finding

Tool definitions include excellent input schemas with Zod, but don't define output schemas. LLMs benefit from knowing the expected response structure.

**Why this matters:** Output schemas help LLMs parse responses correctly and validate expectations.

**Context:** All 19 tools have input schemas but no output schemas.

## 📂 Files

- `src/tools/latitude.tool.ts:538-556` — Tool registration without outputSchema

## 💻 Code

```typescript
// src/tools/latitude.tool.ts:538-546
server.registerTool(
    'latitude_list_projects',
    {
        title: 'List Latitude Projects',
        description: LIST_PROJECTS_DESC,
        inputSchema: ListProjectsInputSchema,
        // Missing: outputSchema
    },
    handleListProjects,
);
```

## 📊 Analysis

**Current:** Tools only define inputSchema. Output format described in text description.

**Assessment:** Per MCP tool description best practices:
- Define outputSchema for deterministic outputs
- Helps LLMs parse responses correctly
- Enables validation of tool responses

**Recommendation:** Add outputSchema to tools where response structure is consistent.

## 🎯 Action

**Priority:** Future (nice-to-have)

**Example Fix:**
```typescript
const ListProjectsOutputSchema = z.object({
    projects: z.array(z.object({
        id: z.number(),
        name: z.string(),
        createdAt: z.string(),
    }))
});

server.registerTool(
    'latitude_list_projects',
    {
        title: 'List Latitude Projects',
        description: LIST_PROJECTS_DESC,
        inputSchema: ListProjectsInputSchema,
        outputSchema: ListProjectsOutputSchema,
    },
    handleListProjects,
);
```

## 💼 Impact

- **Stability:** LLMs may misparse responses
- **Performance:** N/A
- **Scalability:** N/A

## 🔗 Evidence

- MCP Best Practices: "Define outputSchema for deterministic outputs"

## 🔄 Correlation

Enhancement only, not blocking
