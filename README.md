# Latitude MCP Server

A Model Context Protocol (MCP) server for [Latitude](https://latitude.so) - the prompt management platform. Enables AI assistants to manage prompts, versions, and run AI conversations through Latitude's API.

[![NPM Version](https://img.shields.io/npm/v/@anthropic/latitude-mcp-server)](https://www.npmjs.com/package/@anthropic/latitude-mcp-server)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

## Features

- **16 MCP Tools**: Complete coverage of Latitude API for prompts, projects, versions, and conversations
- **4 MCP Resources**: Read-only access to projects, versions, and prompts
- **CLI Commands**: Full CLI for prompt management workflows
- **Dual Transport**: STDIO (for Claude Desktop/Cursor) and HTTP transports
- **Streaming Support**: Real-time streaming for prompt execution and chat
- **Version Control**: Git-like workflow with draft versions and publishing

## What is Latitude?

[Latitude](https://latitude.so) is a prompt management platform that helps teams:
- Version control prompts with Git-like workflows
- Test and evaluate AI responses
- Collaborate on prompt engineering
- Deploy prompts to production

## Prerequisites

- **Node.js** (>=18.x): [Download](https://nodejs.org/)
- **Latitude API Key**: Get from [Latitude Settings](https://app.latitude.so/settings/api-keys)

## Quick Start

```bash
# Install from npm
npm install -g @anthropic/latitude-mcp-server

# Set your API key
export LATITUDE_API_KEY=your_api_key_here

# Run MCP server (STDIO mode for AI assistants)
latitude-mcp

# Or use CLI commands directly
latitude-mcp projects list
latitude-mcp prompts list <projectId>
latitude-mcp run <projectId> <promptPath>
```

## Configuration

Create a `.env` file or set environment variables:

```bash
# Required
LATITUDE_API_KEY=your_latitude_api_key

# Optional
LATITUDE_BASE_URL=https://gateway.latitude.so  # Default API URL
TRANSPORT_MODE=stdio                            # stdio or http
PORT=3000                                       # HTTP port (if using http mode)
DEBUG=false                                     # Enable debug logging
```

## MCP Tools

### Project Management
| Tool | Description |
|------|-------------|
| `latitude_list_projects` | List all projects in workspace |
| `latitude_create_project` | Create a new project |

### Version Control
| Tool | Description |
|------|-------------|
| `latitude_list_versions` | List versions for a project |
| `latitude_get_version` | Get version details |
| `latitude_create_version` | Create a draft version |
| `latitude_publish_version` | Publish draft to live |

### Prompt Management
| Tool | Description |
|------|-------------|
| `latitude_list_prompts` | List prompts in a version |
| `latitude_get_prompt` | Get prompt content |
| `latitude_push_prompt` | Create/update a prompt (content as string) |
| `latitude_push_prompt_from_file` | Push prompt from file path (reads file automatically) |
| `latitude_push_changes` | Push multiple changes at once |
| `latitude_run_prompt` | Execute a prompt |

### Conversations
| Tool | Description |
|------|-------------|
| `latitude_chat` | Continue a conversation |
| `latitude_get_conversation` | Get conversation history |
| `latitude_stop_conversation` | Stop generation |
| `latitude_create_log` | Log conversation for analytics |

## CLI Commands

```bash
# Projects
latitude-mcp projects list
latitude-mcp projects create "My Project"

# Versions
latitude-mcp versions list <projectId>
latitude-mcp versions create <projectId> "v1.0"
latitude-mcp versions publish <projectId> <versionUuid>

# Prompts
latitude-mcp prompts list <projectId>
latitude-mcp prompts get <projectId> <path>

# Push a prompt from file (recommended)
latitude-mcp push <projectId> <versionUuid> --file ./prompts/my-prompt.md
# Prompt path is auto-derived from filename: "my-prompt.md" → "my-prompt"

# Push with custom prompt path
latitude-mcp push <projectId> <versionUuid> support/agent --file ./agent.md

# Push with inline content
latitude-mcp push <projectId> <versionUuid> my-prompt --content "---
model: gpt-4
---
<system>You are helpful.</system>
<user>{{input}}</user>"

# Run a prompt
latitude-mcp run <projectId> <path> --parameters '{"input": "Hello"}'

# Chat
latitude-mcp chat <conversationUuid> --message "Follow up question"
```

## Integration with Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "latitude": {
      "command": "npx",
      "args": ["-y", "@anthropic/latitude-mcp-server"],
      "env": {
        "LATITUDE_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## Integration with Cursor

Add to your Cursor settings:

```json
{
  "mcpServers": {
    "latitude": {
      "command": "npx",
      "args": ["-y", "@anthropic/latitude-mcp-server"],
      "env": {
        "LATITUDE_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## HTTP Mode

For web integrations, run in HTTP mode:

```bash
TRANSPORT_MODE=http latitude-mcp
```

- MCP Endpoint: `http://localhost:3000/mcp`
- Health Check: `http://localhost:3000/`

## Development

```bash
# Clone and install
git clone https://github.com/anthropic/latitude-mcp-server.git
cd latitude-mcp-server
npm install

# Build
npm run build

# Run tests
npm test

# Development with MCP Inspector
npm run mcp:inspect
```

## Architecture

```
src/
├── index.ts              # Entry point, transport setup
├── tools/
│   └── latitude.tool.ts  # MCP tool definitions
├── resources/
│   └── latitude.resource.ts  # MCP resource definitions
├── controllers/
│   └── latitude.controller.ts  # Business logic
├── services/
│   └── vendor.latitude.service.ts  # API client
├── types/
│   └── latitude.types.ts  # TypeScript + Zod schemas
└── cli/
    └── latitude.cli.ts   # CLI commands
```

## License

ISC

## Links

- [Latitude](https://latitude.so)
- [Latitude Docs](https://docs.latitude.so)
- [MCP Specification](https://modelcontextprotocol.io)
