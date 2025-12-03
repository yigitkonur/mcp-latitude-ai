# Dynamic Schema Generation Based on Environment

**Severity:** GOOD | **Category:** architecture | **Component:** types | **Batch:** 5

## 🔍 Finding

Tool schemas dynamically adjust based on environment variables. When `LATITUDE_PROJECT_ID` is set, the `projectId` parameter becomes optional in tool schemas. This is a clever UX optimization.

**Why this is good:** Reduces repetitive parameter passing when users configure a default project.

**Context:** Used for all project-scoped operations.

## 📂 Files

- `src/types/latitude.types.ts:271-311` — Dynamic projectId field
- `src/types/latitude.types.ts:321-359` — Factory functions for schemas

## 💻 Code

```typescript
// src/types/latitude.types.ts:271-280 - Check for default
function hasDefaultProjectId(): boolean {
    return !!process.env.LATITUDE_PROJECT_ID;
}

// src/types/latitude.types.ts:300-311 - Dynamic field
function projectIdField() {
    const hasDefault = hasDefaultProjectId();
    if (hasDefault) {
        return z
            .string()
            .optional()
            .describe(
                `Project ID (optional - using LATITUDE_PROJECT_ID=${getDefaultProjectId()})`,
            );
    }
    return z.string().describe('Project ID');
}

// src/types/latitude.types.ts:321-325 - Factory function
export function getListVersionsInputSchema() {
    return z.object({
        projectId: projectIdField(),  // Dynamic!
    });
}

// src/types/latitude.types.ts:286-294 - Resolution
export function resolveProjectId(args: Record<string, unknown>): string {
    const projectId = (args.projectId as string) || getDefaultProjectId();
    if (!projectId) {
        throw new Error('Project ID is required...');
    }
    return projectId;
}
```

## 📊 Analysis

**What's Good:**
1. **Environment-aware schemas** - Schema changes based on config
2. **Self-documenting** - Description shows default value
3. **Centralized resolution** - `resolveProjectId()` handles all cases
4. **Factory pattern** - Schemas generated fresh with current env state
5. **User-friendly** - Reduces repetitive parameter passing

**Pattern to replicate:**
```typescript
// For any parameter with possible default
function paramWithDefault(key: string, envVar: string) {
    const defaultValue = process.env[envVar];
    if (defaultValue) {
        return z.string().optional().describe(`${key} (default: ${defaultValue})`);
    }
    return z.string().describe(key);
}
```

## 🎯 Action

**Priority:** Replicate for similar parameters (e.g., versionUuid could default to 'live')

## 💼 Impact

- **Stability:** N/A
- **Performance:** N/A
- **Scalability:** Better DX at scale

## 🔗 Evidence

- Reduces tool call complexity for configured users
- Schema description self-documents the default

## 🔄 Correlation

Works with 15-GOOD (Zod schemas) pattern
