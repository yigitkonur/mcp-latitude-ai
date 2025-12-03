# Latitude API Patterns Analysis

**Date:** 2024-12-02
**Source:** openapi.json (Latitude API v1.0.2)
**Base URL:** https://gateway.latitude.so

## Authentication
- **Method:** Bearer Token
- **Header:** `Authorization: Bearer <token>`

## API Structure

### Projects
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v3/projects` | GET | List all projects |
| `/api/v3/projects` | POST | Create project (name required) |

### Versions
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v3/projects/:projectId/versions` | GET | List versions |
| `/api/v3/projects/:projectId/versions` | POST | Create version (name required) |
| `/api/v3/projects/:projectId/versions/:versionUuid` | GET | Get version details |
| `/api/v3/projects/:projectId/versions/:versionUuid/publish` | POST | Publish version (title, description optional) |
| `/api/v3/projects/:projectId/versions/:versionUuid/push` | POST | Push changes (array of changes) |

### Documents/Prompts
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v3/projects/:projectId/versions/:versionUuid/documents` | GET | List all prompts |
| `/api/v3/projects/:projectId/versions/:versionUuid/documents` | POST | Create prompt |
| `/api/v3/projects/:projectId/versions/:versionUuid/documents/:documentPath` | GET | Get specific prompt |
| `/api/v3/projects/:projectId/versions/:versionUuid/documents/create-or-update` | POST | Create or update prompt |
| `/api/v3/projects/:projectId/versions/:versionUuid/documents/get-or-create` | POST | Get or create prompt |
| `/api/v3/projects/:projectId/versions/:versionUuid/documents/run` | POST | Run/execute prompt |
| `/api/v3/projects/:projectId/versions/:versionUuid/documents/logs` | POST | Create prompt log |

### Conversations
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v3/conversations/:conversationUuid` | GET | Get conversation |
| `/api/v3/conversations/:conversationUuid/chat` | POST | Chat in conversation |
| `/api/v3/conversations/:conversationUuid/stop` | POST | Stop conversation |
| `/api/v3/conversations/:conversationUuid/attach` | POST | Attach to conversation |
| `/api/v3/conversations/:conversationUuid/evaluations/:evaluationUuid/annotate` | POST | Annotate evaluation |

### Other
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v3/traces` | POST | Ingest OTLP traces |
| `/api/v3/tools/results` | POST | Submit tool results |

## Key Data Structures

### Project
```json
{
  "id": "number",
  "name": "string",
  "workspaceId": "number",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Version
```json
{
  "id": "number",
  "uuid": "string",
  "title": "string",
  "description": "string|null",
  "projectId": "number",
  "version": "number|null",
  "mergedAt": "datetime|null",
  "status": "string"
}
```

### Document/Prompt
```json
{
  "versionUuid": "string",
  "uuid": "string",
  "path": "string",
  "content": "string",
  "contentHash": "string",
  "config": "object",
  "parameters": {"paramName": {"type": "text|image|file"}},
  "provider": "openai|anthropic|groq|mistral|azure|google|custom|..."
}
```

### Run Request
```json
{
  "path": "string (required)",
  "stream": "boolean (default: false)",
  "parameters": "object",
  "tools": ["string"],
  "userMessage": "string",
  "background": "boolean"
}
```

### Push Changes
```json
{
  "changes": [{
    "path": "string (required)",
    "content": "string (required)",
    "status": "added|modified|deleted|unchanged",
    "contentHash": "string (optional)"
  }]
}
```

## Error Response Format
```json
{
  "name": "string",
  "errorCode": "string",
  "message": "string",
  "details": "object"
}
```

## Version UUID Special Value
- Use `"live"` as versionUuid to reference the live/published version
