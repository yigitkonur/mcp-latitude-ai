# MCP Tool Design for Latitude

**Date:** 2024-12-02
**Based on:** Deep research on MCP best practices + Latitude API analysis

## Design Principles (from Research)

1. **Granularity**: 6-12 tools per server is ideal for AI assistant usability
2. **Entity-centric**: Group related operations, avoid 1:1 endpoint mapping
3. **CLI-parity**: Mirror CLI experience for developer familiarity
4. **Resources for reads**: High-frequency read-only data as resources
5. **Clear descriptions**: When/Why/Inputs/Outputs format

## Tool Design

### Core Tools (10 tools)

| Tool Name | Description | CLI Equivalent |
|-----------|-------------|----------------|
| `latitude_list_projects` | List all projects in workspace | `latitude projects list` |
| `latitude_create_project` | Create a new project | `latitude projects create` |
| `latitude_list_versions` | List versions for a project | `latitude versions list` |
| `latitude_create_version` | Create a draft version | `latitude versions create` |
| `latitude_publish_version` | Publish a draft version to live | `latitude versions publish` |
| `latitude_list_prompts` | List all prompts in a version | `latitude prompts list` |
| `latitude_get_prompt` | Get a specific prompt by path | `latitude prompts get` |
| `latitude_push_prompt` | Create/update prompt(s) - push changes | `latitude push` |
| `latitude_run_prompt` | Execute a prompt with parameters | `latitude run` |
| `latitude_chat` | Continue conversation with a prompt | `latitude chat` |

### Additional Tools (5 tools)

| Tool Name | Description | CLI Equivalent |
|-----------|-------------|----------------|
| `latitude_get_conversation` | Get conversation details | - |
| `latitude_stop_conversation` | Stop an ongoing conversation | - |
| `latitude_create_log` | Create a prompt execution log | - |
| `latitude_get_version` | Get specific version details | `latitude versions get` |
| `latitude_push_changes` | Push multiple document changes at once | `latitude push --all` |

## Tool Schemas

### 1. latitude_list_projects
```typescript
// No required params - lists all projects in authenticated workspace
schema: z.object({})
```

### 2. latitude_create_project
```typescript
schema: z.object({
  name: z.string().describe("Project name")
})
```

### 3. latitude_list_versions
```typescript
schema: z.object({
  projectId: z.string().describe("Project ID")
})
```

### 4. latitude_create_version
```typescript
schema: z.object({
  projectId: z.string().describe("Project ID"),
  name: z.string().describe("Version/commit name")
})
```

### 5. latitude_publish_version
```typescript
schema: z.object({
  projectId: z.string().describe("Project ID"),
  versionUuid: z.string().describe("Version UUID to publish"),
  title: z.string().optional().describe("Publication title"),
  description: z.string().optional().describe("Publication description")
})
```

### 6. latitude_list_prompts
```typescript
schema: z.object({
  projectId: z.string().describe("Project ID"),
  versionUuid: z.string().default("live").describe("Version UUID or 'live' for published version")
})
```

### 7. latitude_get_prompt
```typescript
schema: z.object({
  projectId: z.string().describe("Project ID"),
  versionUuid: z.string().default("live").describe("Version UUID or 'live'"),
  path: z.string().describe("Prompt path (e.g., '/my-prompt' or 'folder/prompt')")
})
```

### 8. latitude_push_prompt
```typescript
schema: z.object({
  projectId: z.string().describe("Project ID"),
  versionUuid: z.string().describe("Target version UUID (must be draft, not 'live')"),
  path: z.string().describe("Prompt path"),
  content: z.string().describe("Prompt content in PromptL format"),
  force: z.boolean().default(false).describe("Force overwrite if exists")
})
```

### 9. latitude_run_prompt
```typescript
schema: z.object({
  projectId: z.string().describe("Project ID"),
  versionUuid: z.string().default("live").describe("Version UUID or 'live'"),
  path: z.string().describe("Prompt path to run"),
  parameters: z.record(z.any()).optional().describe("Prompt parameters as key-value pairs"),
  stream: z.boolean().default(false).describe("Enable streaming response"),
  tools: z.array(z.string()).optional().describe("Tool names to enable"),
  userMessage: z.string().optional().describe("Additional user message")
})
```

### 10. latitude_chat
```typescript
schema: z.object({
  conversationUuid: z.string().describe("Conversation UUID from previous run"),
  message: z.string().describe("User message to send"),
  stream: z.boolean().default(false).describe("Enable streaming response")
})
```

### 11. latitude_get_conversation
```typescript
schema: z.object({
  conversationUuid: z.string().describe("Conversation UUID")
})
```

### 12. latitude_stop_conversation
```typescript
schema: z.object({
  conversationUuid: z.string().describe("Conversation UUID to stop")
})
```

### 13. latitude_create_log
```typescript
schema: z.object({
  projectId: z.string().describe("Project ID"),
  versionUuid: z.string().describe("Version UUID"),
  path: z.string().describe("Prompt path"),
  messages: z.array(z.object({
    role: z.enum(["system", "user", "assistant"]),
    content: z.string()
  })).describe("Conversation messages to log")
})
```

### 14. latitude_get_version
```typescript
schema: z.object({
  projectId: z.string().describe("Project ID"),
  versionUuid: z.string().describe("Version UUID")
})
```

### 15. latitude_push_changes
```typescript
schema: z.object({
  projectId: z.string().describe("Project ID"),
  versionUuid: z.string().describe("Target version UUID"),
  changes: z.array(z.object({
    path: z.string(),
    content: z.string(),
    status: z.enum(["added", "modified", "deleted"]).default("modified")
  })).describe("Array of document changes")
})
```

## Resources (Read-only)

| Resource | URI Pattern | Description |
|----------|-------------|-------------|
| `latitude://projects` | - | List of all projects |
| `latitude://projects/{id}/versions` | - | Versions for a project |
| `latitude://projects/{id}/versions/{uuid}/prompts` | - | Prompts in a version |

## File Structure

```
src/
├── tools/
│   └── latitude.tool.ts          # Tool registration
├── types/
│   └── latitude.types.ts         # Zod schemas
├── controllers/
│   └── latitude.controller.ts    # Business logic
├── services/
│   └── vendor.latitude.service.ts # API client
└── resources/
    └── latitude.resource.ts      # MCP resources
```

## Environment Variables

```env
LATITUDE_API_KEY=your-api-key     # Required - Bearer token for API auth
LATITUDE_BASE_URL=https://gateway.latitude.so  # Optional - API base URL
```
