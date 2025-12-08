# Action Plan to Fix 401 & 405 Errors

## Current Errors

1. **401 Unauthorized** - `/api/users/me` 
   - **Cause**: Strapi requires authentication
   - **Fix**: Make Strapi public OR ensure auth token is being sent

2. **405 Method Not Allowed** - `/api/sales` POST
   - **Cause**: Next.js route handler not being recognized
   - **Fix**: Restart Next.js server + clear cache

## 🔧 Step-by-Step Fix

### Step 1: Make Strapi Public (Fix 401 Error)

```bash
# 1. Make sure Strapi is running
cd project/strapi
npm run develop

# 2. Wait for this message in console:
# ✅ Public permissions configured for all content types

# OR manually configure:
# - Open http://localhost:1337/admin
# - Settings → Roles → Public
# - Enable permissions for 'sale' content type
# - Click Save
```

### Step 2: Restart Next.js Dev Server (Fix 405 Error)

```bash
cd project/frontend

# Stop the server (Ctrl+C in the terminal where it's running)

# Clear Next.js cache
rm -rf .next

# Restart the server
npm run dev
```

**Why this fixes 405**: Next.js needs to recompile route handlers. The `.next` cache can sometimes get stale.

### Step 3: Verify Both Services Are Running

**Terminal 1 - Strapi:**
```bash
cd project/strapi
npm run develop
# Should show: "Server started"
```

**Terminal 2 - Next.js:**
```bash
cd project/frontend
npm run dev
# Should show: "Ready on http://localhost:3000"
```

### Step 4: Test Endpoints

**Test Strapi directly:**
```bash
# Should work if Strapi is public
curl http://localhost:1337/api/sales
```

**Test Next.js API route:**
```bash
curl -X POST http://localhost:3000/api/sales \
  -H "Content-Type: application/json" \
  -d '{"data":{"client":"Test","sale_amount":1000}}'
```

**Expected results:**
- ✅ Strapi: Returns `{"data":[]}` or actual data (200 OK)
- ✅ Next.js: Returns created sale data (201 Created)

### Step 5: Test in Browser

1. Open your app: http://localhost:3000
2. Try to create a sale entry
3. Check browser console - should NOT see errors
4. Check Network tab - requests should succeed

## 🐛 If Still Not Working

### Debug 405 Error (Method Not Allowed)

**Check Next.js console:**
- Look for any error messages
- Should see: "POST /api/sales - Request body: ..."

**Verify route file:**
```bash
cd project/frontend
cat app/api/sales/route.ts | grep -E "export.*(GET|POST)"
```

Should show:
```
export async function GET
export async function POST
```

**Check Next.js version:**
```bash
cd project/frontend
npm list next
```

Should be `14.x.x` (App Router requires Next.js 13+)

### Debug 401 Error (Unauthorized)

**Check Strapi permissions:**
```bash
# Test directly
curl http://localhost:1337/api/sales

# If 403 Forbidden → Permissions not set
# If 200 OK → Permissions are set correctly
```

**Check bootstrap script:**
- Look in Strapi console for: `✅ Public permissions configured`
- If not shown, restart Strapi

## 📋 Quick Checklist

Before testing, ensure:

- [ ] Strapi is running (`npm run develop`)
- [ ] Strapi shows: `✅ Public permissions configured`
- [ ] Next.js is running (`npm run dev`)
- [ ] Next.js `.next` cache cleared (`rm -rf .next`)
- [ ] Both servers restarted after changes

## 🔍 Verification Commands

Run these to verify everything is working:

```bash
# 1. Check Strapi is public
curl http://localhost:1337/api/sales

# 2. Check Next.js route accepts POST
curl -X POST http://localhost:3000/api/sales \
  -H "Content-Type: application/json" \
  -d '{"data":{"client":"Test"}}'

# 3. Check both return success (200 or 201)
```

## ✅ Expected Final State

**After fixes, you should see:**

1. **Strapi Console:**
   ```
   ✅ Public permissions configured for all content types
   [INFO] Server started
   ```

2. **Next.js Console:**
   ```
   POST /api/sales - Request body: { data: { ... } }
   POST /api/sales - Strapi response status: 201
   POST /api/sales - Success: { data: { ... } }
   ```

3. **Browser:**
   - No errors in console
   - Sales form submission works
   - Success message appears

## 🚨 Still Having Issues?

If problems persist:

1. **Check server logs** - Look for error messages
2. **Check browser Network tab** - See actual HTTP responses
3. **Verify environment variables** - Make sure URLs are correct
4. **Test endpoints individually** - Isolate the problem

## 📚 Related Documentation

- `TROUBLESHOOTING_405_ERROR.md` - Detailed 405 fix guide
- `MAKE_PUBLIC_QUICK.md` - Strapi public setup
- `API_AUTH_FIX.md` - Authentication fixes

---

**TL;DR**: 
1. Restart Strapi (wait for bootstrap message)
2. Clear Next.js cache (`rm -rf .next`)
3. Restart Next.js
4. Test endpoints

That should fix both errors! 🎉

