# Errors Explained & How to Fix Them

## Current Errors Analysis

### Error 1: 401 Unauthorized - `/api/users/me`
```
GET http://localhost:1337/api/users/me 401 (Unauthorized)
```

**What's happening:**
- `AuthContext` checks if you're logged in on page load
- It calls Strapi's `/api/users/me` endpoint
- This endpoint **requires authentication** (even if content types are public)
- Since you're not logged in (or token expired), you get 401

**Is this a problem?**
- ❌ **No, this is expected and handled**
- The code at `AuthContext.tsx:65` catches 401 and continues
- The app works fine - you just need to login if you want to use authenticated features

**How to fix (if annoying):**
1. **Login** to the app → Then you'll have a valid token
2. Or ignore it - it's handled gracefully

---

### Error 2: 405 Method Not Allowed - `/api/sales` POST
```
POST http://localhost:3000/api/sales 405 (Method Not Allowed)
```

**What's happening:**
- You're trying to create a sale entry
- Frontend calls `POST /api/sales` (Next.js API route)
- Next.js returns 405 = "POST method not supported"

**Root Cause:**
The route file has the POST handler, but Next.js isn't recognizing it. This usually means:

1. **Next.js dev server needs restart** (most common)
   - Route handlers compile on startup
   - Changes require server restart

2. **Next.js cache is stale**
   - `.next` folder has old cached routes
   - Needs to be cleared

**How to Fix:**

### Fix: Restart Next.js with Cache Clear

```bash
cd project/frontend

# Stop the server (Ctrl+C)

# Clear Next.js cache
rm -rf .next

# Restart
npm run dev
```

**After restart:**
- Route handlers will be recompiled
- POST handler should be recognized
- 405 error should disappear

---

## Complete Fix Checklist

### Step 1: Fix 405 Error (This is the blocking issue)

```bash
cd project/frontend
rm -rf .next
npm run dev
```

### Step 2: Verify POST Works

After restart, test:
```bash
curl -X POST http://localhost:3000/api/sales \
  -H "Content-Type: application/json" \
  -d '{"data":{"client":"Test","sale_amount":1000}}'
```

**Expected**: HTTP 201 Created or forwards to Strapi  
**If still 405**: Check Next.js console for errors

### Step 3: About the 401 Error

The 401 error is **normal**:
- ✅ It's expected when not logged in
- ✅ Code handles it gracefully
- ✅ App continues to work
- ❌ Not breaking anything

**To hide it:**
- Login to the app, or
- The error is already handled (just shows in console)

---

## Why These Errors Happen

### 401 Error Flow:
```
Page Load
  ↓
AuthContext.checkAuth() runs
  ↓
Calls GET /api/users/me (needs auth)
  ↓
No valid token → 401
  ↓
Code catches it → Continues normally
  ↓
User can still use the app
```

### 405 Error Flow:
```
User submits form
  ↓
Frontend calls POST /api/sales
  ↓
Next.js route handler should handle it
  ↓
But Next.js says "405 - Method Not Allowed"
  ↓
Why? Route handler not compiled/recognized
```

---

## Verification

After fixing:

1. **Restart Next.js** (fixes 405)
2. **Test creating sale** - should work now
3. **401 error** - still shows but doesn't break anything

**Quick test:**
```bash
# Should work after restart
curl -X POST http://localhost:3000/api/sales \
  -H "Content-Type: application/json" \
  -d '{"data":{"client":"Test"}}'
```

---

**TL;DR**: 
- **405 Error** → Restart Next.js (`rm -rf .next && npm run dev`)
- **401 Error** → Normal, not a problem (just login if needed)
