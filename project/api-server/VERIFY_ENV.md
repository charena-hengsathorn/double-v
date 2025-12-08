# How to Verify Environment Variables are Loaded

This guide shows you multiple ways to check if environment variables are properly loaded in the API server.

## Method 1: Check Server Startup Console Output

When you start the API server, it will print the loaded environment variables:

```bash
cd project/api-server
npm run dev
```

**Expected output:**
```
🚀 API Server running on port 4000
📍 Environment: development
🔗 Strapi URL: http://localhost:1337
🔗 Predictive Service URL: http://localhost:8000
✅ CORS enabled for: http://localhost:3000
```

If you see the correct URLs, environment variables are loaded! ✅

## Method 2: Use the Environment Check Script

We've created a script to check environment variables:

```bash
cd project/api-server
node scripts/check-env.js
```

This will:
- ✅ Check if `.env.local` or `.env` file exists
- ✅ Verify all required variables are set
- ✅ Show current values (masked if sensitive)
- ✅ List any missing variables

## Method 3: Use the Health Endpoint

### Check Environment Status

```bash
# Get environment variable status
curl http://localhost:4000/health/env
```

Or visit in browser: `http://localhost:4000/health/env`

**Response:**
```json
{
  "loaded": true,
  "source": ".env.local",
  "variables": {
    "PORT": {
      "set": true,
      "value": "4000",
      "length": 4
    },
    "STRAPI_URL": {
      "set": true,
      "value": "http://localhost:1337",
      "length": 22
    },
    "PREDICTIVE_SERVICE_URL": {
      "set": true,
      "value": "http://localhost:8000",
      "length": 22
    }
  },
  "missing": [],
  "warnings": [],
  "timestamp": "2024-01-01T12:00:00.000Z",
  "nodeEnv": "development"
}
```

### Check Raw Environment Variables (Development Only)

```bash
# Get all environment variables (sensitive ones masked)
curl http://localhost:4000/health/env/raw
```

**⚠️ Warning**: This endpoint is only available in development mode. Sensitive variables (passwords, secrets, tokens) are automatically masked.

## Method 4: Detailed Health Check

The detailed health endpoint shows which backend services are accessible using your environment variables:

```bash
curl http://localhost:4000/health/detailed
```

**Response:**
```json
{
  "status": "healthy",
  "service": "double-v-api-server",
  "version": "1.0.0",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "services": {
    "strapi": {
      "status": "connected",
      "responseTime": 45
    },
    "predictive": {
      "status": "connected",
      "responseTime": 32
    }
  }
}
```

If services show as "connected", your environment variables are working! ✅

## Method 5: Test in Node.js REPL

You can also check environment variables directly:

```bash
cd project/api-server
node
```

Then in the Node.js REPL:
```javascript
// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

// Check variables
console.log('PORT:', process.env.PORT);
console.log('STRAPI_URL:', process.env.STRAPI_URL);
console.log('PREDICTIVE_SERVICE_URL:', process.env.PREDICTIVE_SERVICE_URL);
console.log('CORS_ORIGINS:', process.env.CORS_ORIGINS);

// Exit
.exit
```

## Method 6: Check Environment File Location

Verify the `.env.local` file exists and is in the right place:

```bash
cd project/api-server
ls -la .env.local
```

You should see:
```
-rw-r--r--  1 user  staff  123 Jan  1 12:00 .env.local
```

## Common Issues

### Issue: Variables show as "not set"

**Possible causes:**
1. `.env.local` file doesn't exist
   - **Fix**: `cp env.example .env.local`
   
2. File is in wrong location
   - **Fix**: Ensure `.env.local` is in `project/api-server/` directory
   
3. File has syntax errors
   - **Fix**: Check for missing `=` signs, quotes, etc.
   
4. Server not restarted
   - **Fix**: Restart the server after changing `.env.local`

### Issue: Variables show default values

**Cause**: Environment variable not set, so code uses defaults

**Fix**: Add the variable to `.env.local`:
```env
PORT=4000
STRAPI_URL=http://localhost:1337
```

### Issue: Variables loaded but services can't connect

**Possible causes:**
1. URLs are incorrect
   - **Fix**: Check `STRAPI_URL` and `PREDICTIVE_SERVICE_URL` values
   
2. Services not running
   - **Fix**: Start Strapi and Predictive Service
   
3. Wrong port numbers
   - **Fix**: Verify services are running on expected ports

## Environment Variable Loading Priority

The API server loads environment variables in this order (highest priority first):

1. **System environment variables** (set in shell)
2. **`.env.local`** (local development file)
3. **`.env`** (fallback file)
4. **Default values** (hardcoded in code)

## Quick Verification Checklist

- [ ] `.env.local` file exists in `project/api-server/`
- [ ] Server console shows correct URLs on startup
- [ ] `/health/env` endpoint shows `"loaded": true`
- [ ] `/health/detailed` shows services as "connected"
- [ ] All required variables are set

## Example: Complete Verification

```bash
# 1. Check env file exists
cd project/api-server
ls -la .env.local

# 2. Verify with script
node scripts/check-env.js

# 3. Start server
npm run dev

# In another terminal:

# 4. Check environment status
curl http://localhost:4000/health/env

# 5. Check service connections
curl http://localhost:4000/health/detailed
```

## Security Notes

- ✅ `.env.local` files are git-ignored (safe for secrets)
- ✅ Health endpoints mask sensitive variables
- ✅ `/health/env/raw` only works in development mode
- ⚠️  Never commit `.env.local` files to git
- ⚠️  Never expose raw environment variables in production

## Need Help?

If environment variables aren't loading:

1. Run the check script: `node scripts/check-env.js`
2. Check server console output on startup
3. Visit `/health/env` endpoint in browser
4. Verify `.env.local` file syntax is correct
5. Restart the server after making changes

See also:
- `ENV_SETUP_GUIDE.md` - Complete environment setup guide
- `README.md` - API server documentation

