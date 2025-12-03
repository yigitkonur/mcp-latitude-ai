# Implementation Plan - Latitude MCP Server

**Date:** 2024-12-02
**Based on:** API patterns + MCP tool design

## Task Overview

| # | Task | Pattern Source | Est. Time |
|---|------|----------------|-----------|
| 01 | Setup & Config | Boilerplate patterns | 15 min |
| 02 | Types & Schemas | OpenAPI + Zod | 30 min |
| 03 | HTTP Service | Boilerplate service pattern | 30 min |
| 04 | Controllers | Boilerplate controller pattern | 45 min |
| 05 | Tools | Boilerplate tool pattern | 60 min |
| 06 | Resources | Boilerplate resource pattern | 20 min |
| 07 | CLI Commands | Boilerplate CLI pattern | 30 min |
| 08 | Integration & Test | Boilerplate test patterns | 30 min |

## Detailed Tasks

### Task 01: Setup & Configuration
- [1] Update package.json name to `@latitude/mcp-server`
- [2] Add LATITUDE_API_KEY to .env.example
- [3] Update constants with Latitude branding
- [4] Update README with Latitude-specific docs

### Task 02: Types & Schemas
- [1] Create `src/types/latitude.types.ts`
- [2] Define Project, Version, Document, Conversation types
- [3] Create Zod schemas for API responses
- [4] Create Zod schemas for tool inputs
- [5] Export all types and schemas

### Task 03: HTTP Service Layer
- [1] Create `src/services/vendor.latitude.service.ts`
- [2] Implement base API client with Bearer auth
- [3] Implement projects API methods
- [4] Implement versions API methods
- [5] Implement documents API methods
- [6] Implement conversations API methods
- [7] Implement run/chat streaming methods
- [8] Add error handling per Latitude error format

### Task 04: Controllers
- [1] Create `src/controllers/latitude.controller.ts`
- [2] Implement project controller methods
- [3] Implement version controller methods
- [4] Implement prompt/document controller methods
- [5] Implement conversation controller methods
- [6] Implement run controller with stream handling
- [7] Add TOON/JSON output formatting

### Task 05: Tools Registration
- [1] Create `src/tools/latitude.tool.ts`
- [2] Register `latitude_list_projects` tool
- [3] Register `latitude_create_project` tool
- [4] Register `latitude_list_versions` tool
- [5] Register `latitude_create_version` tool
- [6] Register `latitude_publish_version` tool
- [7] Register `latitude_list_prompts` tool
- [8] Register `latitude_get_prompt` tool
- [9] Register `latitude_push_prompt` tool
- [10] Register `latitude_run_prompt` tool
- [11] Register `latitude_chat` tool
- [12] Register additional tools (get_conversation, stop, create_log, push_changes)
- [13] Update index.ts to import and register Latitude tools

### Task 06: Resources
- [1] Create `src/resources/latitude.resource.ts`
- [2] Implement projects resource
- [3] Implement versions resource
- [4] Implement prompts resource
- [5] Update index.ts to register resources

### Task 07: CLI Commands
- [1] Create `src/cli/latitude.cli.ts`
- [2] Implement `latitude projects` command
- [3] Implement `latitude versions` command
- [4] Implement `latitude prompts` command
- [5] Implement `latitude run` command
- [6] Implement `latitude push` command
- [7] Update CLI index to include Latitude commands

### Task 08: Integration & Testing
- [1] Create test files for service
- [2] Create test files for controller
- [3] Create test files for tools
- [4] Run end-to-end test with real API
- [5] Update documentation

## Cleanup Tasks
- Remove IP address example files (tool, controller, service, resource)
- Update all references in index.ts

## Success Criteria
- All 15 tools registered and functional
- Resources accessible via MCP
- CLI commands working
- API key authentication working
- Streaming responses working for run/chat
- Error handling matches Latitude error format
