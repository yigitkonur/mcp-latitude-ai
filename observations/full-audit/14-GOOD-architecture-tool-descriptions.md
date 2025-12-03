# Excellent Tool Descriptions with Markdown

**Severity:** GOOD | **Category:** architecture | **Component:** tools | **Batch:** 2

## 🔍 Finding

Tool descriptions are exceptionally well-structured with markdown formatting, clear sections (Use when, Parameters, Returns, Example), and practical examples. This is a pattern to replicate.

**Why this is good:** Well-structured descriptions help LLMs select the right tool and understand parameters.

**Context:** All 19 tools have detailed descriptions.

## 📂 Files

- `src/tools/latitude.tool.ts:33-228` — Excellent description constants
- `src/tools/docs.tool.ts:18-202` — Detailed markdown tables and examples

## 💻 Code

```typescript
// src/tools/latitude.tool.ts:33-39 - Example of good description
const LIST_PROJECTS_DESC = `List all projects in your Latitude workspace.

**Use when:** You need to see available projects or find a project ID.

**Returns:** Array of projects with id, name, createdAt, updatedAt.

**Example:** Call without parameters to get all projects.`;
```

## 📊 Analysis

**What's Good:**
1. **Clear purpose statement** - First line says what it does
2. **Use when section** - Helps LLM decide when to use
3. **Parameters section** - Explicit parameter documentation
4. **Returns section** - Expected output format
5. **Examples** - Concrete usage patterns
6. **Markdown formatting** - Tables, code blocks for clarity

**Research Validation:** Per MCP tool description best practices:
- "Tool descriptions ≤2 sentences for purpose, front-loaded"
- "Operational details in schema, not description"
- Current approach is comprehensive but may be token-heavy

## 🎯 Action

**Priority:** Replicate this pattern

**Document:** Use this structure for all new tools:
```markdown
[One-line purpose statement]

**Use when:** [Decision criteria for LLM]

**Parameters:**
- `param1` (required) - Description
- `param2` (optional) - Description with default

**Returns:** [Output description]

**Example:**
\`\`\`
[Concrete usage example]
\`\`\`
```

## 💼 Impact

- **Stability:** Better tool selection by LLMs
- **Performance:** Possibly more tokens than needed
- **Scalability:** Easy to maintain pattern

## 🔗 Evidence

- Research shows this structure outperforms minimal descriptions
- LLMs benefit from "Use when" guidance

## 🔄 Correlation

Pair with 09-MEDIUM (output schemas) for complete tool definitions
