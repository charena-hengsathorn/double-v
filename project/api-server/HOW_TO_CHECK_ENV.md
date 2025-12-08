# How to Check if Environment Variables are Injected

## ✅ Quick Answer

Your environment variables **ARE** being loaded! As shown by the check script:

```
✅ PORT: 4000
✅ STRAPI_URL: http://localhost:1337
✅ PREDICTIVE_SERVICE_URL: http://localhost:8000
✅ CORS_ORIGINS: http://localhost:3000,http://localhost:3001
```

## 🔍 Methods to Verify

### Method 1: Check Script (Fastest) ⚡

```bash
cd project/api-server
npm run check-env
```

**What it shows:**
- ✅ Which `.env.local` file is being used
- ✅ All environment variables and their values
- ✅ Missing required variables

### Method 2: Server Console Output 📺

When you start the server:

```bash
cd project/api-server
npm run dev
```

**Look for these startup messages:**
```
🚀 API Server running on port 4000
📍 Environment: development
🔗 Strapi URL: http://localhost:1337          ← Shows env vars are loaded
🔗 Predictive Service URL: http://localhost:8000
✅ CORS enabled for: http://localhost:3000
```

### Method 3: Health Endpoint (Runtime Check) 🌐

Start the server, then check:

```bash
# Visit in browser or use curl
curl http://localhost:4000/health/env
```

**Response:**
```json
{
  "loaded": true,
  "source": ".env.local",
  "variables": {
    "PORT": { "set": true, "value": "4000" },
    "STRAPI_URL": { "set": true, "value": "http://localhost:1337" }
  },
  "missing": []
}
```

### Method 4: Detailed Health Check 🔍

Check if services are accessible using your env vars:

```bash
curl http://localhost:4000/health/detailed
```

If services show as "connected", your env vars are working! ✅

### Method 5: Node.js REPL Test 💻

```bash
cd project/api-server
node
```

Then:
```javascript
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

console.log('PORT:', process.env.PORT);
console.log('STRAPI_URL:', process.env.STRAPI_URL);
```

### Method 6: Quick Command Line Test 🚀

```bash
cd project/api-server
node -e "require('dotenv').config({ path: '.env.local' }); console.log('PORT:', process.env.PORT, '| STRAPI_URL:', process.env.STRAPI_URL);"
```

## 📊 What Gets Loaded

Environment variables are loaded in this order:

1. **System environment variables** (from shell)
2. **`.env.local`** ← Your local development file
3. **`.env`** (fallback)
4. **Default values** (hardcoded in code)

The API server loads `.env.local` first, then falls back to `.env`.

## 🎯 Quick Verification Commands

```bash
# 1. Check if .env.local exists
cd project/api-server
ls -la .env.local

# 2. Verify env vars are loaded
npm run check-env

# 3. Start server and check console
npm run dev
# Look for the startup messages showing URLs

# 4. Check via HTTP endpoint (in another terminal)
curl http://localhost:4000/health/env
```

## ✅ Current Status

Based on the check script output, your environment variables **are working correctly**:

- ✅ `.env.local` file found
- ✅ All required variables are set
- ✅ Values are loaded correctly

## 🔧 Troubleshooting

### Variables not showing?

1. **Check file exists:**
   ```bash
   ls -la project/api-server/.env.local
   ```

2. **Check file location:**
   - Must be in `project/api-server/` directory
   - Must be named exactly `.env.local` (not `.env.local.txt`)

3. **Restart server:**
   - Environment variables are loaded on startup
   - Changes to `.env.local` require server restart

### Wrong values?

1. **Check for typos** in `.env.local`
2. **No spaces** around `=` sign
3. **Check priority** - System ENV vars override `.env.local`

## 📚 More Information

- `VERIFY_ENV.md` - Complete verification guide
- `QUICK_ENV_CHECK.md` - Quick reference
- `ENV_SETUP_GUIDE.md` - Full environment setup guide

---

**TL;DR**: Your env vars are loaded! Use `npm run check-env` or check server startup console. ✅

