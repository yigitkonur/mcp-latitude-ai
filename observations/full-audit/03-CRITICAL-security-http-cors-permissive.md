# HTTP Transport Has Permissive CORS Configuration

**Severity:** CRITICAL | **Category:** security | **Component:** http-transport | **Batch:** 1

## 🔍 Finding

The HTTP transport uses `cors()` middleware with no configuration, allowing requests from any origin. This is a security vulnerability when the MCP server is exposed to the network.

**Why this matters:** An attacker could craft a malicious webpage that makes requests to the MCP server from any domain, potentially executing tools on behalf of authenticated users.

**Context:** Only affects HTTP transport mode (`TRANSPORT_MODE=http`).

## 📂 Files

- `src/index.ts:84-86` — Permissive CORS setup

## 💻 Code

```typescript
// src/index.ts:84-86
const app = express();
app.use(cors());  // Allows ALL origins!
app.use(express.json());
```

## 📊 Analysis

**Current:** `cors()` with no options allows:
- Any origin (Access-Control-Allow-Origin: *)
- Any method
- Any headers

**Assessment:** Per MCP security guidelines:
- CORS should be restricted to known origins
- For local-only servers, bind to localhost and restrict origin
- For production, explicit allowlist required

**Recommendation:** Configure CORS with explicit allowed origins.

**Reference:** [MCP Security Best Practices](https://www.legitsecurity.com/aspm-knowledge-base/model-context-protocol-security)

## 🎯 Action

**Priority:** Immediate (if using HTTP transport)

**Fix:**
```typescript
// src/index.ts
const ALLOWED_ORIGINS = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        if (ALLOWED_ORIGINS.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('CORS not allowed'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

**Verify:** Make request from disallowed origin; should receive CORS error.

## 💼 Impact

- **Security:** Cross-site request forgery possible
- **Stability:** N/A
- **Scalability:** N/A

## 🔗 Evidence

- MCP Best Practices: "Enforce TLS, HSTS, and restrict CORS to known origins"
- OWASP: Permissive CORS is a security vulnerability

## 🔄 Correlation

Related to 04-HIGH (no rate limiting) and 08-HIGH (no security headers)
All HTTP transport security issues should be addressed together
