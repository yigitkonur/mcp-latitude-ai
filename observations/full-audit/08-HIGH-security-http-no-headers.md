# HTTP Transport Missing Security Headers

**Severity:** HIGH | **Category:** security | **Component:** http-transport | **Batch:** 1

## 🔍 Finding

The HTTP transport doesn't set security headers like `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, or `Content-Security-Policy`. This leaves the server vulnerable to various attacks when exposed to the network.

**Why this matters:** Missing security headers enable clickjacking, MIME-sniffing attacks, and protocol downgrade attacks.

**Context:** Only affects HTTP transport mode.

## 📂 Files

- `src/index.ts:80-133` — HTTP setup with no security headers

## 💻 Code

```typescript
// src/index.ts:84-86
const app = express();
app.use(cors());
app.use(express.json());
// No security headers middleware!
```

## 📊 Analysis

**Current:** No security headers set on responses.

**Assessment:** Per OWASP and MCP security best practices, these headers should be set:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: no-referrer`
- `Content-Security-Policy: default-src 'none'`
- `Strict-Transport-Security` (if HTTPS)

**Recommendation:** Add helmet middleware or manual headers.

**Reference:** [OWASP Security Headers](https://owasp.org/www-project-secure-headers/)

## 🎯 Action

**Priority:** This Sprint (if using HTTP transport)

**Fix Option 1 - Using helmet:**
```bash
npm install helmet
```

```typescript
import helmet from 'helmet';

const app = express();
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'none'"],
            connectSrc: ["'self'"],
        },
    },
    frameguard: { action: 'deny' },
    referrerPolicy: { policy: 'no-referrer' },
}));
```

**Fix Option 2 - Manual headers:**
```typescript
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Content-Security-Policy', "default-src 'none'");
    next();
});
```

**Verify:** Check response headers include security headers.

## 💼 Impact

- **Security:** Vulnerable to MIME-sniffing, clickjacking
- **Stability:** N/A
- **Scalability:** N/A

## 🔗 Evidence

- MCP Best Practices: "X-Content-Type-Options: nosniff, X-Frame-Options: DENY"
- OWASP: Required headers for web security

## 🔄 Correlation

Part of HTTP security bundle with 03-CRITICAL (CORS) and 04-HIGH (rate limiting)
