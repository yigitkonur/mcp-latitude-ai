---
description: Complete guide for LLMs to autonomously manage, test, and optimize PromptL prompts via MCP
auto_execution_mode: 3
---

# LATITUDE MCP SERVER - LLM AUTONOMOUS GUIDE

> "File-first workflow: Pull → Edit → Push → Test → Iterate"

## GOLDEN RULE: FILE PATHS ONLY

```
❌ NEVER: Write prompt content directly in tool calls
✅ ALWAYS: Create .promptl files, use filePaths parameter
```

**Why?** Files are versionable, editable, reviewable. Inline content is messy and hard to iterate.

---

## THE 7 TOOLS

| Tool | Purpose | Key Param |
|------|---------|-----------|
| `list_prompts` | See what exists | — |
| `get_prompt` | Read prompt content | `name` |
| `run_prompt` | Execute with params | `name`, `parameters` |
| `pull_prompts` | Download all → `./prompts/` | `outputDir?` |
| `add_prompt` | Add/update (never deletes) | `filePaths` ✅ |
| `push_prompts` | Replace ALL (FULL SYNC) | `filePaths` ✅ |
| `docs` | Learn PromptL | `action`, `query`/`topic` |

---

## FILE-FIRST WORKFLOW

### Step 1: Pull

```json
{ "tool": "pull_prompts" }
```
Creates `./prompts/*.promptl`

### Step 2: Create/Edit File

```bash
# Create new file
echo '---
provider: openai
model: gpt-4o
temperature: 0.2
---
<user>Extract email from: {{ text }}</user>' > ./prompts/email-extractor.promptl
```

### Step 3: Push via File Path

```json
{
  "tool": "add_prompt",
  "filePaths": ["./prompts/email-extractor.promptl"],
  "versionName": "feat/add-email-extractor"
}
```

### Step 4: Test

```json
{
  "tool": "run_prompt",
  "name": "email-extractor",
  "parameters": { "text": "Contact john@example.com" }
}
```

### Step 5: Iterate

Edit file → `add_prompt` again → `run_prompt` → repeat until quality is perfect

---

## 📚 LEARN PROMPTL WITH `docs` TOOL

### How to Use

```json
{ "tool": "docs", "action": "help" }           // Overview of all 52 topics
{ "tool": "docs", "action": "find", "query": "json schema" }  // Search
{ "tool": "docs", "action": "get", "topic": "config-json-output" }  // Get specific
```

### Learning Menu: "To build X, call Y"

| I want to... | Call this |
|--------------|-----------|
| **Understand PromptL basics** | `docs(action: "get", topic: "overview")` |
| **Learn file structure** | `docs(action: "get", topic: "structure")` |
| **Use variables** | `docs(action: "get", topic: "variables")` |
| **Add conditionals (if/else)** | `docs(action: "get", topic: "conditionals")` |
| **Loop through items** | `docs(action: "get", topic: "loops")` |

| I want to... | Call this |
|--------------|-----------|
| **Configure provider/model** | `docs(action: "get", topic: "config-basics")` |
| **Get JSON output (schema)** | `docs(action: "get", topic: "config-json-output")` |
| **Set temperature/tokens** | `docs(action: "get", topic: "config-generation")` |
| **Use OpenAI models** | `docs(action: "get", topic: "providers-openai")` |
| **Use Anthropic models** | `docs(action: "get", topic: "providers-anthropic")` |

| I want to... | Call this |
|--------------|-----------|
| **Write system/user/assistant** | `docs(action: "get", topic: "messages-roles")` |
| **Use images (multimodal)** | `docs(action: "get", topic: "messages-multimodal")` |

| I want to... | Call this |
|--------------|-----------|
| **Add few-shot examples** | `docs(action: "get", topic: "technique-few-shot")` |
| **Chain of thought reasoning** | `docs(action: "get", topic: "technique-cot")` |
| **Build agents with tools** | `docs(action: "get", topic: "agents")` |
| **Define custom tools** | `docs(action: "get", topic: "tools-custom")` |
| **Multi-step chains** | `docs(action: "get", topic: "chains")` |

| I want to build... | Call this |
|--------------------|-----------|
| **Data extraction** | `docs(action: "get", topic: "recipe-extraction")` |
| **Classification** | `docs(action: "get", topic: "recipe-classification")` |
| **Chatbot** | `docs(action: "get", topic: "recipe-chatbot")` |
| **RAG system** | `docs(action: "get", topic: "recipe-rag")` |
| **Content moderation** | `docs(action: "get", topic: "recipe-moderation")` |

### Quick Search Examples

```json
// Don't know exact topic? Search!
{ "tool": "docs", "action": "find", "query": "extract structured data" }
{ "tool": "docs", "action": "find", "query": "few shot examples" }
{ "tool": "docs", "action": "find", "query": "agent autonomous" }
{ "tool": "docs", "action": "find", "query": "loop array items" }
{ "tool": "docs", "action": "find", "query": "temperature settings" }
```

---

## 🎯 DYNAMIC TOOL DESCRIPTIONS

**No need to call `list_prompts` first!**

`run_prompt` description shows:
```
Available prompts (10):
- email-extractor (params: text)
- sentiment (params: input, language)
- cover-letter (params: job_details, patterns, company)
```

`add_prompt` description shows:
```
Available prompts (10): email-extractor, sentiment, cover-letter, ...
```

**Check tool description → know what exists + what params needed**

---

## AUTONOMOUS ITERATION LOOP

```
1. Learn pattern    → docs(action: "find", query: "...")
2. Create file      → ./prompts/my-prompt.promptl
3. Push             → add_prompt(filePaths: [...], versionName: "v1")
4. Test             → run_prompt(name: "...", parameters: {...})
5. Analyze output   → Good? Done. Bad? Continue.
6. Edit file        → Improve based on output analysis
7. Re-push          → add_prompt(filePaths: [...], versionName: "v2")
8. Re-test          → run_prompt again
9. Repeat 5-8       → Until quality threshold met
```

---

## BULK TESTING WITH MCP INSPECTOR

```bash
# Test single prompt
npx @modelcontextprotocol/inspector \
  -e LATITUDE_API_KEY=$KEY -e LATITUDE_PROJECT_ID=$ID \
  --cli npx -y mcp-latitude-prompts@3.2.1 \
  --method tools/call \
  --tool-name run_prompt \
  --tool-arg name=email-extractor \
  --tool-arg 'parameters={"text":"john@example.com"}'

# Test multiple prompts in loop
for p in email-extractor sentiment classifier; do
  echo "=== $p ===" && npx @modelcontextprotocol/inspector \
    -e LATITUDE_API_KEY=$KEY -e LATITUDE_PROJECT_ID=$ID \
    --cli npx -y mcp-latitude-prompts@3.2.1 \
    --method tools/call --tool-name run_prompt \
    --tool-arg name=$p --tool-arg 'parameters={"text":"test"}'
done

# Analyze outputs → update weak prompts → re-test
```

---

## VERSION NAMING

```
feat/add-email-extractor    # New feature
fix/improve-accuracy        # Bug fix
refactor/simplify-prompt    # Cleanup
perf/reduce-tokens          # Performance
test/add-examples           # Testing
```

Omit → auto-generates timestamp

---

## SYNC BEHAVIOR

| Tool | Behavior |
|------|----------|
| `add_prompt` | ADDITIVE - adds/updates, never deletes |
| `push_prompts` | FULL SYNC - replaces ALL, deletes extras |
| `pull_prompts` | FULL SYNC - deletes local first |

**Use `add_prompt` for normal work. Use `push_prompts` only for reset/init.**

---

## VALIDATION

All writes validate BEFORE API calls:

```
❌ Validation Failed

Error Code: `message-tag-inside-message`
Location: Line 4, Column 7
Code Context:
4: <user><assistant>Nested!</assistant></user>
          ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Fix: Move nested tag outside parent.
```

**Fix file → re-push → validation passes**

---

## PROMPTL QUICK REFERENCE

### Basic Structure

```yaml
---
provider: openai
model: gpt-4o
temperature: 0.2
---
<system>You are a helpful assistant.</system>
<user>{{ user_input }}</user>
```

### With Schema (JSON Output)

```yaml
---
provider: openai
model: gpt-4o
schema:
  type: object
  properties:
    result: { type: string }
  required: [result]
---
<user>{{ input }}</user>
```

### Few-Shot Examples

```yaml
---
provider: openai
model: gpt-4o
---
<user>Classify: Great product!</user>
<assistant>positive</assistant>

<user>Classify: Terrible experience</user>
<assistant>negative</assistant>

<user>Classify: {{ text }}</user>
```

### Temperature Guide

```
0.0-0.2  Deterministic (extraction, classification)
0.3-0.5  Balanced (Q&A, analysis)
0.6-0.8  Creative (writing, brainstorming)
```

---

## COMPLETE EXAMPLE: BUILD EMAIL EXTRACTOR

```bash
# 1. Learn JSON schema pattern
docs(action: "get", topic: "config-json-output")

# 2. Create file
cat > ./prompts/email-extractor.promptl << 'EOF'
---
provider: openai
model: gpt-4o
temperature: 0.1
schema:
  type: object
  properties:
    email: { type: string }
    name: { type: [string, "null"] }
  required: [email]
---
<system>
Extract email and name. Return null for name if not found.
</system>
<user>{{ text }}</user>
EOF

# 3. Push
add_prompt(filePaths: ["./prompts/email-extractor.promptl"], versionName: "v1")

# 4. Test
run_prompt(name: "email-extractor", parameters: { text: "John at john@example.com" })

# 5. Output not good? Edit file, re-push as v2, re-test
# 6. Repeat until perfect
```

---

## ANTI-PATTERNS

| ❌ Don't | ✅ Do |
|----------|-------|
| Write content in tool call | Create .promptl file, use filePaths |
| Guess PromptL syntax | `docs(action: "find", query: "...")` |
| Call list_prompts first | Check run_prompt tool description |
| Use push_prompts casually | Use add_prompt (safer) |
| Skip testing | run_prompt after every change |

---

## QUICK COMMANDS

```
"What prompts exist?"      → Check run_prompt description (dynamic)
"What params does X need?" → Check run_prompt description (dynamic)
"Learn about schemas"      → docs(action: "get", topic: "config-json-output")
"Search for X"             → docs(action: "find", query: "X")
"Add my file"              → add_prompt(filePaths: ["./prompts/x.promptl"])
"Test prompt"              → run_prompt(name: "x", parameters: {...})
"Pull all prompts"         → pull_prompts
```

---

## WISDOM

**File-First:** "Never write prompt content in tool calls. Always use filePaths."

**Learn-First:** "docs(find) → docs(get) → create file → push → test"

**Iterate:** "Edit file → add_prompt → run_prompt → analyze → repeat"

**Dynamic:** "Tool descriptions show prompts + params. No listing needed."

**Validate:** "Client-side validation catches errors before API calls."