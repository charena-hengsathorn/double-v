# Troubleshooting 405 Method Not Allowed Error

## Current Issues

You're experiencing:
1. **401 Unauthorized** on `/api/users/me` - Authentication issue
2. **405 Method Not Allowed** on `/api/sales` POST - Route handler issue

## Issue Analysis

### 405 Error Root Cause

The 405 error suggests that Next.js is not recognizing the POST handler in `/app/api/sales/route.ts`. This can happen if:

1. **Next.js dev server needs restart** - Route handlers need to be recompiled
2. **Route file syntax issue** - Export might not be correct
3. **File not being recognized** - Next.js might not see the route file

## Solutions to Try

### Solution 1: Restart Next.js Dev Server ⚡

This is the most common fix:

```bash
cd project/frontend

# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

**Why**: Next.js needs to recompile route handlers when they change.

### Solution 2: Verify Route File Structure

Make sure the route file is correctly structured:

**File**: `project/frontend/app/api/sales/route.ts`

Should have:
```typescript
export async function GET(request: NextRequest) {
  // GET handler
}

export async function POST(request: NextRequest) {
  // POST handler
}
```

### Solution 3: Check Next.js Version

Next.js 13+ App Router should support route handlers. Check version:

```bash
cd project/frontend
npm list next
```

Should be `14.x.x` or `13.x.x`.

### Solution 4: Clear Next.js Cache

Sometimes Next.js cache causes issues:

```bash
cd project/frontend

# Remove Next.js cache
rm -rf .next

# Restart dev server
npm run dev
```

### Solution 5: Verify Route Handler Exports

The route handlers must be named exports. Check that your file has:

```typescript
import { NextRequest, NextResponse } from 'next/server';

// ✅ Correct - named exports
export async function GET(request: NextRequest) { }
export async function POST(request: NextRequest) { }
```

NOT:
```typescript
// ❌ Wrong - default export won't work
export default async function handler(req, res) { }
```

## 401 Error Solutions

### Make Strapi Public (For Development)

The 401 error happens because Strapi requires authentication. You have two options:

#### Option A: Make Strapi Public (Easiest for Dev)

1. **Restart Strapi**:
   ```bash
   cd project/strapi
   npm run develop
   ```

2. **Watch for bootstrap message**:
   ```
   ✅ Public permissions configured for all content types
   ```

3. **OR manually configure**:
   - Open: http://localhost:1337/admin
   - Go to: Settings → Roles → Public
   - Enable permissions for `sale` content type
   - Click Save

#### Option B: Use Authentication (For Production)

Make sure your frontend includes the JWT token in requests (already implemented in `lib/api.ts`).

## Complete Fix Checklist

Follow these steps in order:

### Step 1: Fix Strapi Permissions

```bash
# Make sure Strapi is running
cd project/strapi
npm run develop

# Wait for: "✅ Public permissions configured for all content types"
```

### Step 2: Restart Next.js

```bash
cd project/frontend

# Stop server (Ctrl+C)
# Clear cache
rm -rf .next

# Restart
npm run dev
```

### Step 3: Test Endpoints

```bash
# Test Strapi directly (should work if public)
curl http://localhost:1337/api/sales

# Test Next.js API route
curl -X POST http://localhost:3000/api/sales \
  -H "Content-Type: application/json" \
  -d '{"data":{"client":"Test","sale_amount":1000}}'
```

### Step 4: Verify in Browser

1. Open browser console
2. Try creating a sale entry
3. Check network tab for actual error messages

## Debugging Steps

### Check Server Logs

Watch both servers' console output:

**Next.js Console**:
- Should show: "POST /api/sales - Request body: ..."
- Should show: "POST /api/sales - Strapi response status: ..."

**Strapi Console**:
- Should show incoming requests
- Should not show 403/401 errors

### Test Directly to Strapi

```bash
# Test if Strapi accepts POST (without going through Next.js)
curl -X POST http://localhost:1337/api/sales \
  -H "Content-Type: application/json" \
  -d '{"data":{"client":"Test","sale_amount":1000}}'
```

If this works → Next.js route issue  
If this fails → Strapi permissions issue

### Check Network Tab

In browser DevTools → Network tab:
1. Find the failed request
2. Check Request Method (should be POST)
3. Check Request Headers
4. Check Response status and body

## Common Issues and Fixes

### Issue: Route Handler Not Found

**Symptom**: 404 instead of 405

**Fix**: 
- Check file is at: `app/api/sales/route.ts`
- Not at: `pages/api/sales.ts` (that's Pages Router, not App Router)

### Issue: Multiple Route Conflicts

**Symptom**: Unexpected behavior

**Fix**: Make sure you don't have both:
- `app/api/sales/route.ts` (App Router)
- `pages/api/sales.ts` (Pages Router)

Only use App Router (`app/` directory).

### Issue: TypeScript Errors

**Symptom**: Route handler doesn't compile

**Fix**: 
```bash
cd project/frontend
npm run build
# Check for TypeScript errors
```

## Quick Test Script

Run this to diagnose:

```bash
#!/bin/bash

echo "Testing Next.js API Route..."
curl -X POST http://localhost:3000/api/sales \
  -H "Content-Type: application/json" \
  -d '{"data":{"client":"Test"}}' \
  -w "\nHTTP Status: %{http_code}\n"

echo ""
echo "Testing Strapi Directly..."
curl -X POST http://localhost:1337/api/sales \
  -H "Content-Type: application/json" \
  -d '{"data":{"client":"Test"}}' \
  -w "\nHTTP Status: %{http_code}\n"
```

## Expected Behavior After Fix

✅ **Next.js API Route**:
- POST to `/api/sales` returns 201 Created
- Request body is logged in console
- Response includes created sale data

✅ **Strapi**:
- Accepts POST requests to `/api/sales`
- Returns 201 with created data
- No 403/401 errors

✅ **Frontend**:
- Sales form submission works
- No errors in console
- Success message appears

## Still Not Working?

If issues persist:

1. **Check Next.js version**:
   ```bash
   cd project/frontend
   npm list next
   ```

2. **Verify file structure**:
   ```
   app/
     api/
       sales/
         route.ts  ← Must be here
   ```

3. **Check for syntax errors**:
   ```bash
   cd project/frontend
   npx tsc --noEmit
   ```

4. **Check browser console** for detailed error messages

## Next Steps

1. ✅ Restart Next.js dev server
2. ✅ Make Strapi public (restart Strapi)
3. ✅ Test endpoints
4. ✅ Check console logs
5. ✅ Verify in browser

