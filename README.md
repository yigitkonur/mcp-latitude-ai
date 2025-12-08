# Latitude MCP Server

> Model Context Protocol server for [Latitude.so](https://latitude.so) prompt management

Manage AI prompts directly from your MCP-compatible AI assistant. Push, pull, run, and version PromptL prompts with 8 focused tools.

[![npm version](https://img.shields.io/npm/v/latitude-mcp-server.svg)](https://www.npmjs.com/package/latitude-mcp-server)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

---

## Features

- **8 MCP Tools** - Push, pull, run, and manage prompts
- **52 Documentation Topics** - Comprehensive PromptL syntax guide
- **Semantic Search** - Find docs by natural language query
- **File Operations** - Pull prompts to local `.promptl` files
- **Version Control** - Manage LIVE and draft versions
- **Zero Config** - Works with `LATITUDE_API_KEY` environment variable

---

## Quick Start

### Installation

```bash
npm install -g latitude-mcp-server
```

### Configuration

Set environment variables:

```bash
export LATITUDE_API_KEY="your-api-key"
export LATITUDE_PROJECT_ID="your-project-id"
```

Get your API key from [Latitude Settings](https://app.latitude.so/settings).

### Usage with MCP Client

Add to your MCP client config (e.g., Claude Desktop):

```json
{
  "mcpServers": {
    "latitude": {
      "command": "npx",
      "args": ["latitude-mcp-server"],
      "env": {
        "LATITUDE_API_KEY": "your-api-key",
        "LATITUDE_PROJECT_ID": "your-project-id"
      }
    }
  }
}
```

---

## Available Tools

| Tool | Description |
|------|-------------|
| `list_prompts` | List all prompts in LIVE version |
| `get_prompt` | Get full prompt content by name |
| `run_prompt` | Execute a prompt with parameters |
| `push_prompts` | Replace ALL prompts (destructive) |
| `append_prompts` | Add prompts without removing existing |
| `pull_prompts` | Download prompts to local files |
| `replace_prompt` | Replace or create single prompt |
| `docs` | Get documentation (52 topics) |

---

## Common Workflows

### Pull Prompts to Local Files

```
pull_prompts({ outputDir: "./prompts" })
```

Downloads all LIVE prompts to `./prompts/*.promptl` files.

### List Available Prompts

```
list_prompts()
```

Returns all prompt names in your project.

### Get Prompt Content

```
get_prompt({ name: "my-prompt" })
```

Retrieves full PromptL content including config and messages.

### Run a Prompt

```
run_prompt({ 
  name: "my-prompt",
  parameters: { user_name: "Alice" }
})
```

Executes the prompt and returns AI response.

### Update a Prompt

```
replace_prompt({
  name: "greeting",
  content: `---
provider: OpenAI
model: gpt-4o
---
Hello {{ user_name }}!`
})
```

Creates or updates a single prompt in LIVE.

### Get Documentation

```
docs({ action: "help" })                    # Overview
docs({ action: "find", query: "variables" }) # Search
docs({ action: "get", topic: "chains" })     # Specific topic
```

Access comprehensive PromptL documentation (52 topics).

---

## Documentation Topics (52)

### Core Syntax (12)
`overview`, `structure`, `variables`, `conditionals`, `loops`, `references`, `tools`, `chains`, `agents`, `techniques`, `agent-patterns`, `mocking`

### Configuration (8)
`config-basics`, `config-generation`, `config-json-output`, `config-advanced`, `providers-openai`, `providers-anthropic`, `providers-google`, `providers-azure`

### Messages (2)
`messages-roles`, `messages-multimodal`

### Tools (4)
`tools-builtin`, `tools-custom`, `tools-schema`, `tools-orchestration`

### Techniques (12)
`technique-role`, `technique-few-shot`, `technique-cot`, `technique-tot`, `technique-react`, `technique-self-consistency`, `technique-constitutional`, `technique-socratic`, `technique-meta`, `technique-iterative`, `technique-step-back`, `technique-rag`

### Recipes (8)
`recipe-classification`, `recipe-extraction`, `recipe-generation`, `recipe-chatbot`, `recipe-rag`, `recipe-analysis`, `recipe-moderation`, `recipe-support`

### Guides (6)
`conversation-history`, `guide-debugging`, `guide-safety`, `guide-performance`, `guide-testing`, `guide-versioning`

---

## Development

### Build

```bash
npm run build
```

Compiles TypeScript to `dist/`.

### Test with MCP Inspector

```bash
npx @modelcontextprotocol/inspector \
  -e LATITUDE_API_KEY=your-key \
  -e LATITUDE_PROJECT_ID=your-id \
  --cli node dist/index.js \
  --method tools/list
```

### Local Development

```bash
# Build and run
npm run build
node dist/index.js

# With environment variables
LATITUDE_API_KEY=xxx LATITUDE_PROJECT_ID=yyy node dist/index.js
```

---

## Project Structure

```
latitude-mcp-server/
├── src/
│   ├── docs/              # Documentation system (52 topics)
│   │   ├── types.ts       # Type definitions
│   │   ├── metadata.ts    # Search metadata
│   │   ├── help.ts        # Help content
│   │   ├── core-syntax.ts # Core PromptL syntax (12 topics)
│   │   ├── phase1.ts      # Tier 1 topics (8)
│   │   ├── phase2.ts      # Tier 2 topics (13)
│   │   ├── phase3.ts      # Tier 3 topics (6)
│   │   ├── techniques.ts  # Prompting techniques (8)
│   │   ├── recipes.ts     # Use case recipes (5)
│   │   └── index.ts       # DOCS_MAP + functions
│   ├── utils/             # Utilities
│   │   ├── config.util.ts # Environment config
│   │   └── logger.util.ts # Logging
│   ├── api.ts             # Latitude API client
│   ├── docs.ts            # Documentation exports
│   ├── index.ts           # MCP server entry
│   ├── server.ts          # MCP server setup
│   ├── tools.ts           # 8 MCP tools
│   └── types.ts           # Type definitions
├── scripts/
│   └── ensure-executable.js
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `LATITUDE_API_KEY` | Yes | Your Latitude API key |
| `LATITUDE_PROJECT_ID` | Yes | Your project ID |
| `DEBUG` | No | Enable debug logging |

---

## PromptL Syntax Overview

PromptL is a templating language for AI prompts:

```promptl
---
provider: OpenAI
model: gpt-4o
temperature: 0.7
schema:
  type: object
  properties:
    answer:
      type: string
  required: [answer]
---
<system>
You are a helpful assistant.
</system>

<user>
{{ question }}
</user>
```

**Key Features:**
- YAML config header (provider, model, temperature)
- Message tags (`<system>`, `<user>`, `<assistant>`)
- Variables (`{{ name }}`)
- Conditionals (`{{ if }}`, `{{ else }}`)
- Loops (`{{ for item in items }}`)
- Tools (function calling)
- Chains (multi-step `<step>`)
- Agents (autonomous `type: agent`)

Use `docs({ action: "get", topic: "overview" })` for complete guide.

---

## API Reference

### list_prompts()

List all prompts in LIVE version.

**Returns:** Array of prompt names

### get_prompt({ name })

Get full prompt content.

**Parameters:**
- `name` (string) - Prompt name

**Returns:** Prompt content with config and messages

### run_prompt({ name, parameters })

Execute a prompt.

**Parameters:**
- `name` (string) - Prompt name
- `parameters` (object) - Input parameters

**Returns:** AI response

### pull_prompts({ outputDir? })

Download prompts to local files.

**Parameters:**
- `outputDir` (string, optional) - Output directory (default: `./prompts`)

**Returns:** List of created files

### replace_prompt({ name?, content?, filePath? })

Replace or create a single prompt. **Shows all available prompts in description.**

**Parameters (choose one approach):**

**Option A - Direct content:**
- `name` (string) - Prompt name
- `content` (string) - Full PromptL content

**Option B - From file:**
- `filePath` (string) - Path to `.promptl` file (name auto-detected from filename)
- `name` (string, optional) - Override name from filename

**Returns:** Success confirmation + updated list of all LIVE prompts

### append_prompts({ prompts?, filePaths?, overwrite? })

Add prompts without removing existing ones.

**Parameters (choose one approach):**

**Option A - Direct content:**
- `prompts` (array) - Array of `{ name, content }`

**Option B - From files:**
- `filePaths` (array) - Array of paths to `.promptl` files

**Common:**
- `overwrite` (boolean, optional) - Overwrite existing (default: false)

**Returns:** Success confirmation + updated list of all LIVE prompts

### push_prompts({ prompts?, filePaths? })

⚠️ **Destructive:** Replaces ALL prompts in LIVE.

**Parameters (choose one approach):**

**Option A - Direct content:**
- `prompts` (array) - Array of `{ name, content }`

**Option B - From files:**
- `filePaths` (array) - Array of paths to `.promptl` files

**Returns:** Success confirmation + updated list of all LIVE prompts

### docs({ action, topic?, query? })

Get documentation.

**Parameters:**
- `action` (string) - `"help"`, `"get"`, or `"find"`
- `topic` (string, optional) - Topic name for `"get"`
- `query` (string, optional) - Search query for `"find"`

**Returns:** Documentation content

---

## Examples

### Example 1: Pull → Edit → Push Workflow (Recommended)

```javascript
// 1. Pull all prompts to local files
pull_prompts({ outputDir: "./prompts" })
// Creates: ./prompts/my-prompt.promptl, ./prompts/other-prompt.promptl, etc.

// 2. Edit files locally in your IDE

// 3. Push single file back (name auto-detected from filename)
replace_prompt({ filePath: "./prompts/my-prompt.promptl" })

// 4. Or push multiple files
append_prompts({ 
  filePaths: ["./prompts/prompt-a.promptl", "./prompts/prompt-b.promptl"],
  overwrite: true 
})
```

### Example 2: Create New Prompt

```javascript
replace_prompt({
  name: "sentiment-analyzer",
  content: `---
provider: OpenAI
model: gpt-4o
temperature: 0
schema:
  type: object
  properties:
    sentiment:
      type: string
      enum: [positive, negative, neutral]
  required: [sentiment]
---
<system>
You are a sentiment analysis expert.
</system>

<user>
Analyze: {{ text }}
</user>`
})
```

### Example 3: Run with Parameters

```javascript
const result = await run_prompt({
  name: "sentiment-analyzer",
  parameters: { text: "I love this product!" }
})

// Returns: { sentiment: "positive" }
```

### Example 4: Search Documentation

```javascript
// Find topics about JSON
docs({ action: "find", query: "json output" })

// Get specific topic
docs({ action: "get", topic: "config-json-output" })
```

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run build` to verify
5. Submit a pull request

---

## License

ISC License - see LICENSE file for details

---

## Links

- [Latitude Platform](https://latitude.so)
- [Latitude Documentation](https://docs.latitude.so)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [npm Package](https://www.npmjs.com/package/latitude-mcp-server)
- [GitHub Repository](https://github.com/yigitkonur/latitude-mcp-server)

---

## Support

- **Issues:** [GitHub Issues](https://github.com/yigitkonur/latitude-mcp-server/issues)
- **Documentation:** Use `docs({ action: "help" })` tool
- **Latitude Support:** [Latitude Discord](https://discord.gg/latitude)

---

**Built with ❤️ for the MCP ecosystem**
