# API Credentials Fetched on Every Request

**Severity:** MEDIUM | **Category:** performance | **Component:** services | **Batch:** 4

## 🔍 Finding

The `getLatitudeCredentials()` function reads environment variables and creates the authorization header on every API call. While not expensive, this could be optimized.

**Why this matters:** Minor performance optimization opportunity.

**Context:** Called for every API request.

## 📂 Files

- `src/services/vendor.latitude.service.ts:38-56` — getLatitudeCredentials called per request

## 💻 Code

```typescript
// src/services/vendor.latitude.service.ts:38-56
function getLatitudeCredentials(): { apiKey: string; baseUrl: string } {
    const methodLogger = Logger.forContext(...);  // Logger created each time
    
    const apiKey = config.get('LATITUDE_API_KEY');  // Read each time
    const baseUrl = config.get('LATITUDE_BASE_URL') || LATITUDE_BASE_URL;
    
    // Validation each time
    if (!apiKey) {
        throw createAuthInvalidError(...);
    }
    
    return { apiKey, baseUrl };
}
```

## 📊 Analysis

**Current:** Credentials read from env vars on every API call.

**Assessment:** Config rarely changes during runtime. Could cache at module level.

**Recommendation:** Cache credentials at module initialization.

## 🎯 Action

**Priority:** Future (minor optimization)

**Fix:**
```typescript
// Cache at module level
let cachedCredentials: { apiKey: string; baseUrl: string } | null = null;

function getLatitudeCredentials(): { apiKey: string; baseUrl: string } {
    if (cachedCredentials) return cachedCredentials;
    
    const apiKey = config.get('LATITUDE_API_KEY');
    const baseUrl = config.get('LATITUDE_BASE_URL') || LATITUDE_BASE_URL;
    
    if (!apiKey) {
        throw createAuthInvalidError(...);
    }
    
    cachedCredentials = { apiKey, baseUrl };
    return cachedCredentials;
}
```

## 💼 Impact

- **Stability:** N/A
- **Performance:** Minor improvement
- **Scalability:** N/A

## 🔄 Correlation

Minor optimization, not urgent
