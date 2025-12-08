# API Authentication Fix

## Issues Fixed

### 1. 401 Unauthorized Error
**Problem**: `/api/users/me` and other Strapi endpoints were returning 401 because authentication headers weren't being forwarded.

**Solution**: Updated Next.js API routes to forward the `Authorization` header from the client request to Strapi.

### 2. 405 Method Not Allowed Error
**Problem**: POST requests to `/api/sales` were failing with 405 because Strapi requires authentication for write operations.

**Solution**: 
- Updated API routes to forward auth headers
- Updated API client to include auth headers in requests

## Changes Made

### 1. Updated Next.js API Routes

**File**: `project/frontend/app/api/sales/route.ts`
- ✅ Added Authorization header forwarding for GET requests
- ✅ Added Authorization header forwarding for POST requests

**File**: `project/frontend/app/api/sales/[id]/route.ts`
- ✅ Added Authorization header forwarding for GET requests
- ✅ Added Authorization header forwarding for PUT requests
- ✅ Added Authorization header forwarding for DELETE requests

### 2. Updated API Client

**File**: `project/frontend/lib/api.ts`
- ✅ Updated `getSales()` to include Authorization header
- ✅ Updated `createSales()` to include Authorization header
- ✅ Updated `updateSales()` to include Authorization header
- ✅ Updated `deleteSales()` to include Authorization header

## How It Works

### Request Flow

```
Frontend Component
  ↓ (includes JWT token in Authorization header)
API Client (lib/api.ts)
  ↓ (forwards Authorization header)
Next.js API Route (/api/sales)
  ↓ (forwards Authorization header to Strapi)
Strapi Backend
```

### Code Example

**Frontend API Client** (`lib/api.ts`):
```typescript
const token = getAuthToken(); // From localStorage
const headers = {
  'Content-Type': 'application/json',
};

if (token) {
  headers['Authorization'] = `Bearer ${token}`;
}

const response = await fetch('/api/sales', {
  method: 'POST',
  headers,
  body: JSON.stringify({ data }),
});
```

**Next.js API Route** (`app/api/sales/route.ts`):
```typescript
export async function POST(request: NextRequest) {
  // Get Authorization header from incoming request
  const authHeader = request.headers.get('authorization');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  // Forward Authorization header if present
  if (authHeader) {
    headers['Authorization'] = authHeader;
  }
  
  // Forward to Strapi
  const response = await fetch(`${STRAPI_URL}/api/sales`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
}
```

## Testing

After these fixes, you should be able to:

1. ✅ **Login** - Authentication works correctly
2. ✅ **Fetch sales** - GET requests include auth headers
3. ✅ **Create sales** - POST requests include auth headers (no more 405 error)
4. ✅ **Update sales** - PUT requests include auth headers
5. ✅ **Delete sales** - DELETE requests include auth headers

## Verification

To verify the fixes are working:

1. **Check Browser Console**: Should no longer see 401 or 405 errors
2. **Check Network Tab**: 
   - Requests to `/api/sales` should include `Authorization: Bearer <token>` header
   - Responses should be 200/201 instead of 401/405
3. **Test Operations**:
   - Create a new sale entry
   - Update an existing sale
   - Delete a sale
   - All should work without authentication errors

## Notes

- The JWT token is stored in `localStorage` and retrieved via `getAuthToken()`
- The token is automatically included in all API requests through the API client
- Next.js API routes act as a proxy and forward the auth header to Strapi
- If no auth token exists, requests will still work but may be rejected by Strapi (which is expected behavior)

## Related Files

- `project/frontend/lib/api.ts` - API client
- `project/frontend/app/api/sales/route.ts` - Sales API route handler
- `project/frontend/app/api/sales/[id]/route.ts` - Individual sale API route handler
- `project/frontend/app-shell/context/AuthContext.tsx` - Authentication context

