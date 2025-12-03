# Log Files Accumulate Without Cleanup

**Severity:** HIGH | **Category:** maintainability | **Component:** utils | **Batch:** 5

## 🔍 Finding

The logger creates a new log file for each session in `~/.mcp/data/` with format `latitude-mcp-server.{uuid}.log`. These files are never cleaned up, potentially filling disk space over time.

**Why this matters:** Long-running deployments or frequent restarts will accumulate thousands of log files.

**Context:** Every server start creates a new permanent log file.

## 📂 Files

- `src/utils/logger.util.ts:146-170` — Log file creation without cleanup

## 💻 Code

```typescript
// src/utils/logger.util.ts:156-170
const LOG_FILENAME = `${CLI_NAME}.${SESSION_ID}.log`;
const LOG_FILEPATH = path.join(MCP_DATA_DIR, LOG_FILENAME);

// Write initial log header - creates new file every session
fs.writeFileSync(
    LOG_FILEPATH,
    `# ${CLI_NAME} Log Session\n` +
    `Session ID: ${SESSION_ID}\n` +
    // ... header content
);
// No cleanup of old files!
```

## 📊 Analysis

**Current:** Each session creates a new UUID-named log file. Files persist forever.

**Assessment:** Per logging best practices:
- Log rotation should be implemented
- Old logs should be cleaned up
- Consider external log aggregation (stderr-only for 12-factor apps)
- For file logging, max files or max age policy needed

**Recommendation:** Add log cleanup on startup or use rotation.

**Reference:** [12-Factor App Logging](https://12factor.net/logs)

## 🎯 Action

**Priority:** This Sprint

**Fix Option 1 - Cleanup on startup:**
```typescript
// src/utils/logger.util.ts - Add cleanup function
function cleanupOldLogs(maxFiles = 10, maxAgeDays = 7) {
    const files = fs.readdirSync(MCP_DATA_DIR)
        .filter(f => f.startsWith(CLI_NAME) && f.endsWith('.log'))
        .map(f => ({
            name: f,
            path: path.join(MCP_DATA_DIR, f),
            mtime: fs.statSync(path.join(MCP_DATA_DIR, f)).mtime
        }))
        .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
    
    // Keep only maxFiles most recent
    files.slice(maxFiles).forEach(f => {
        fs.unlinkSync(f.path);
    });
    
    // Delete files older than maxAgeDays
    const maxAge = Date.now() - (maxAgeDays * 24 * 60 * 60 * 1000);
    files.filter(f => f.mtime.getTime() < maxAge).forEach(f => {
        fs.unlinkSync(f.path);
    });
}

// Call on initialization
cleanupOldLogs();
```

**Fix Option 2 - Stderr only (12-factor):**
```typescript
// Remove file logging, use stderr only
// Let external tools (systemd, Docker, PM2) handle log management
```

**Verify:** Start server 15 times; only 10 log files should remain.

## 💼 Impact

- **Stability:** Disk space exhaustion over time
- **Performance:** N/A
- **Scalability:** More sessions = more disk usage

## 🔗 Evidence

- 12-Factor App: "Logs are streams, not files"
- MCP Best Practices: "Forward logs to tamper-evident storage"

## 🔄 Correlation

Standalone finding, but consider overall logging strategy
