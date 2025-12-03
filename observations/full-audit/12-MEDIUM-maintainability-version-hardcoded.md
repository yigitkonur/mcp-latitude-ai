# VERSION Constant Hardcoded Instead of From package.json

**Severity:** MEDIUM | **Category:** maintainability | **Component:** utils | **Batch:** 5

## 🔍 Finding

The VERSION constant is hardcoded in `constants.util.ts` instead of being read from `package.json`. This creates a risk of version mismatch.

**Why this matters:** Version should come from single source of truth (package.json).

**Context:** VERSION is used in server identification and logging.

## 📂 Files

- `src/utils/constants.util.ts:12` — Hardcoded VERSION
- `package.json:3` — Authoritative version

## 💻 Code

```typescript
// src/utils/constants.util.ts:12
export const VERSION = '1.0.0';  // Hardcoded!

// package.json:3
"version": "1.0.1",  // Different!
```

## 📊 Analysis

**Current:** VERSION is '1.0.0' but package.json is '1.0.1'. Already out of sync!

**Assessment:** Version should be read from package.json or injected at build time.

**Recommendation:** Read version from package.json at runtime or build time.

## 🎯 Action

**Priority:** Next Sprint

**Fix Option 1 - Runtime read:**
```typescript
// src/utils/constants.util.ts
import { readFileSync } from 'fs';
import { resolve } from 'path';

const packageJson = JSON.parse(
    readFileSync(resolve(__dirname, '../../package.json'), 'utf-8')
);
export const VERSION = packageJson.version;
```

**Fix Option 2 - Build-time injection:**
```json
// package.json scripts
"build": "tsc && node -e \"const fs=require('fs');const p=require('./package.json');fs.writeFileSync('dist/version.json',JSON.stringify({version:p.version}));\""
```

## 💼 Impact

- **Stability:** Version mismatch confusion
- **Performance:** N/A
- **Scalability:** N/A

## 🔗 Evidence

- Currently out of sync (1.0.0 vs 1.0.1)

## 🔄 Correlation

Simple fix, should do soon
