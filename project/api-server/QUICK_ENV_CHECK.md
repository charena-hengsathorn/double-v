# Quick Environment Variable Check

## 🚀 Fastest Ways to Verify Environment Variables

### 1. Check Server Console (Easiest)

Start the server and check the console output:

```bash
cd project/api-server
npm run dev
```

**Look for these lines:**
```
🔗 Strapi URL: http://localhost:1337
🔗 Predictive Service URL: http://localhost:8000
✅ CORS enabled for: http://localhost:3000
```

If you see the correct URLs, env vars are loaded! ✅

### 2. Use the Check Script

```bash
cd project/api-server
npm run check-env
```

This shows:
- ✅ Which env file is being used
- ✅ All environment variables and their values
- ✅ Missing required variables

### 3. Check Health Endpoint

```bash
# Start server first, then:
curl http://localhost:4000/health/env
```

Or visit in browser: **http://localhost:4000/health/env**

### 4. Test Environment Variables in Code

Create a test file:

```bash
cd project/api-server
node -e "require('dotenv').config({ path: '.env.local' }); console.log('PORT:', process.env.PORT); console.log('STRAPI_URL:', process.env.STRAPI_URL);"
```

## 📋 Quick Checklist

- [ ] `.env.local` file exists in `project/api-server/`
- [ ] Server shows correct URLs on startup
- [ ] `/health/env` shows `"loaded": true`
- [ ] Services connect (check `/health/detailed`)

## 🔍 Common Issues

**Variables not loading?**
- Check file name: Must be exactly `.env.local`
- Check location: Must be in `project/api-server/` directory
- Restart server after changes

**Wrong values?**
- Check for typos in `.env.local`
- Verify no spaces around `=` sign
- Check priority: System ENV > `.env.local` > `.env` > defaults

## 📚 More Details

See `VERIFY_ENV.md` for complete documentation.

