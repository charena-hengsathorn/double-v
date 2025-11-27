# Troubleshooting Guide

## Common Issues and Solutions

### 1. Strapi API Returns 404

**Symptoms:**
- `GET /api/pipeline-deals` returns 404
- Predictive service gets 500 errors
- Frontend shows "Error loading data"

**Solution:**
1. Open Strapi Admin: http://localhost:1337/admin
2. Go to **Settings** → **Users & Permissions Plugin** → **Roles** → **Public**
3. Enable all permissions (find, findOne, create, update, delete) for:
   - `client`
   - `project`
   - `pipeline-deal`
   - `deal-milestone`
   - `forecast-snapshot`
   - `billing`
   - `risk-flag`
4. Click **Save**
5. Restart Strapi

**Quick Test:**
```bash
curl http://localhost:1337/api/pipeline-deals
# Should return: {"data":[]}
```

---

### 2. Predictive Service Returns 500 Errors

**Symptoms:**
- All `/api/v1/models/*` endpoints return 500
- Browser console shows "Request failed with status code 500"

**Causes & Solutions:**

**A. Strapi Not Available (404 from Strapi)**
- **Fix**: Configure Strapi permissions (see Issue #1)
- The predictive service now handles this gracefully and returns empty data

**B. Strapi Content Types Not Registered**
- **Fix**: Restart Strapi to register content types
- Check Strapi logs for schema errors

**C. Missing Environment Variables**
- **Fix**: Ensure `.env.local` exists in `project/predictive-service/`
- Copy from `env.example` if needed

**Quick Test:**
```bash
curl http://localhost:8000/api/v1/health
# Should return: {"status":"healthy",...}
```

---

### 3. Frontend Shows 404 or Blank Page

**Symptoms:**
- `http://localhost:3000` shows 404
- Pages don't load

**Solutions:**

**A. Next.js Cache Issue**
```bash
cd project/frontend
rm -rf .next
npm run dev
```

**B. Missing Dependencies**
```bash
cd project/frontend
rm -rf node_modules
npm install
```

**C. Port Conflict**
- Check if port 3000 is in use: `lsof -i :3000`
- Kill conflicting process or use different port

---

### 4. Strapi Won't Start

**Symptoms:**
- Strapi process dies immediately
- Error in logs about schema or database

**Solutions:**

**A. Schema Error**
- Check logs: `tail -50 /tmp/strapi.log`
- Common: relation `inversedBy` issues
- Fix: Ensure bidirectional relations are properly configured

**B. Database Error**
- Check database connection in `.env`
- For SQLite: ensure `.tmp/data.db` directory exists
- For PostgreSQL: verify connection string

**C. Cache Issue**
```bash
cd project/strapi
rm -rf .next dist
npm run develop
```

---

### 5. Services Start But Can't Connect

**Symptoms:**
- Services show as "ready" but APIs fail
- Connection refused errors

**Solutions:**

**A. Check Service URLs**
- Verify environment variables match actual URLs
- Check `.env.local` files in each service

**B. Check CORS**
- Strapi CORS configured in `config/middlewares.ts`
- Should allow `http://localhost:3000` and `http://localhost:8000`

**C. Check Firewall/Ports**
- Ensure ports 1337, 8000, 3000 are not blocked
- Test with: `curl http://localhost:PORT`

---

### 6. Next.js Hydration Warning

**Symptoms:**
- Console warning: "Extra attributes from the server: cz-shortcut-listen,style"

**Solution:**
- This is a harmless warning from browser extensions
- Already fixed in `layout.tsx` with `suppressHydrationWarning`
- Can be ignored

---

## Diagnostic Commands

### Check Service Status
```bash
# Check if services are running
ps aux | grep -E "(strapi|uvicorn|next)" | grep -v grep

# Check ports
lsof -i :1337  # Strapi
lsof -i :8000  # Predictive Service
lsof -i :3000  # Frontend
```

### View Logs
```bash
# Strapi
tail -f /tmp/strapi.log

# Predictive Service
tail -f /tmp/predictive.log

# Frontend
tail -f /tmp/frontend.log
```

### Test APIs
```bash
# Run test script
./scripts/test-apis.sh

# Or manually
curl http://localhost:1337/api/pipeline-deals
curl http://localhost:8000/api/v1/health
curl http://localhost:3000
```

### Reset Everything
```bash
# Stop all services
pkill -f "strapi\|uvicorn\|next"

# Clear caches
cd project/strapi && rm -rf .next dist
cd ../frontend && rm -rf .next
cd ../predictive-service && rm -rf __pycache__

# Restart
./start-demo.sh
```

---

## Getting Help

1. **Check Logs First**: Always check service logs for detailed error messages
2. **Verify Permissions**: Most issues are Strapi permission-related
3. **Test Endpoints**: Use `curl` or the test script to isolate issues
4. **Check Environment**: Ensure all `.env.local` files are configured

---

## Quick Health Check

Run this to check all services:
```bash
echo "Strapi:" && curl -s http://localhost:1337/admin > /dev/null && echo "✅ Running" || echo "❌ Not running"
echo "Predictive:" && curl -s http://localhost:8000/api/v1/health > /dev/null && echo "✅ Running" || echo "❌ Not running"
echo "Frontend:" && curl -s http://localhost:3000 > /dev/null && echo "✅ Running" || echo "❌ Not running"
```

