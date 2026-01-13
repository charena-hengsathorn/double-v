# Migration Guide: Moving to Node.js API Server

This guide explains how to migrate from direct backend API calls to using the new Node.js API Server.

## Overview

**Before:** Frontend → Strapi + Predictive Service (direct calls)  
**After:** Frontend → API Server → Strapi + Predictive Service

## Benefits

1. ✅ Single API endpoint for frontend
2. ✅ Backend URLs hidden from browser
3. ✅ Centralized error handling
4. ✅ Easy to add caching, rate limiting, etc.
5. ✅ Better CORS management

## Step 1: Start the API Server

```bash
cd project/api-server
npm install
cp env.example .env
# Edit .env with your configuration
npm run dev
```

The server will run on `http://localhost:4000` by default.

## Step 2: Update Frontend Environment Variables

Add to `project/frontend/.env.local`:

```env
# New: API Server URL
NEXT_PUBLIC_API_SERVER_URL=http://localhost:4000

# Keep these for now (or remove after migration)
# NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
# NEXT_PUBLIC_PREDICTIVE_SERVICE_URL=http://localhost:8000
```

## Step 3: Update API Client

Replace `project/frontend/lib/api.ts` with the new version:

1. Backup the current file:
```bash
cp project/frontend/lib/api.ts project/frontend/lib/api.old.ts
```

2. Use the new API client (`api-new.ts` has been created as a reference)

The main changes:
- **Base URL**: Use `API_SERVER_URL` instead of separate backend URLs
- **Strapi routes**: Add `/api/v1/strapi` prefix
- **Predictive routes**: Add `/api/v1/predictive` prefix

### Example Changes

**Before:**
```typescript
const STRAPI_URL = 'http://localhost:1337/api';
const response = await axios.get(`${STRAPI_URL}/clients`);
```

**After:**
```typescript
const API_SERVER_URL = 'http://localhost:4000';
const response = await axios.get(`${API_SERVER_URL}/api/v1/strapi/clients`);
```

## Step 4: Remove Next.js API Routes (Optional)

If you're no longer using Next.js API routes (`/app/api/sales/*`), you can remove them:

```bash
rm -rf project/frontend/app/api
```

The API server now handles all proxying.

## Step 5: Test the Migration

1. Start all services:
   - Strapi: `cd project/strapi && npm run develop`
   - Predictive Service: `cd project/predictive-service && uvicorn app.main:app --reload`
   - API Server: `cd project/api-server && npm run dev`
   - Frontend: `cd project/frontend && npm run dev`

2. Test API endpoints:
   - Visit `http://localhost:4000/health` - should return health status
   - Visit `http://localhost:4000/health/detailed` - should show backend service status
   - Test frontend - all API calls should work through the API server

## Step 6: Update Production Configuration

### Environment Variables

Update your production environment variables:

**Frontend (Vercel/Netlify):**
```
NEXT_PUBLIC_API_SERVER_URL=https://your-api-server.herokuapp.com
```

**API Server (Heroku/etc):**
```
STRAPI_URL=https://your-strapi.herokuapp.com
PREDICTIVE_SERVICE_URL=https://your-predictive-service.herokuapp.com
CORS_ORIGINS=https://your-frontend.vercel.app
```

### Deployment

Deploy the API server similar to other services:

**Heroku:**
```bash
cd project/api-server
heroku create double-v-api-server
heroku config:set STRAPI_URL=https://your-strapi.herokuapp.com
heroku config:set PREDICTIVE_SERVICE_URL=https://your-predictive-service.herokuapp.com
heroku config:set CORS_ORIGINS=https://your-frontend.vercel.app
git subtree push --prefix project/api-server heroku main
```

## API Endpoint Mapping

### Strapi Endpoints

| Old (Direct) | New (Via API Server) |
|--------------|---------------------|
| `GET /api/clients` | `GET /api/v1/strapi/clients` |
| `GET /api/pipeline-deals` | `GET /api/v1/strapi/pipeline-deals` |
| `GET /api/sales` | `GET /api/v1/strapi/sales` |
| `POST /api/sales` | `POST /api/v1/strapi/sales` |

### Predictive Service Endpoints

| Old (Direct) | New (Via API Server) |
|--------------|---------------------|
| `GET /api/v1/models/forecast/base` | `GET /api/v1/predictive/models/forecast/base` |
| `GET /api/v1/models/risk/heatmap` | `GET /api/v1/predictive/models/risk/heatmap` |
| `GET /api/v1/health` | `GET /api/v1/predictive/health` |

## Troubleshooting

### CORS Errors

Make sure `CORS_ORIGINS` in API server `.env` includes your frontend URL:
```env
CORS_ORIGINS=http://localhost:3000,https://your-frontend.vercel.app
```

### 502 Bad Gateway

This means the API server can't reach the backend services:
1. Check backend services are running
2. Verify `STRAPI_URL` and `PREDICTIVE_SERVICE_URL` in API server `.env`
3. Check network connectivity

### 404 Not Found

Check the route prefix:
- Strapi routes need `/api/v1/strapi` prefix
- Predictive routes need `/api/v1/predictive` prefix

### Authentication Issues

The API server passes through the `Authorization` header. Make sure:
1. Frontend is sending the JWT token
2. Token is valid
3. Backend services accept the token format

## Rollback

If you need to rollback:

1. Restore old API client:
```bash
mv project/frontend/lib/api.old.ts project/frontend/lib/api.ts
```

2. Restore environment variables in frontend `.env.local`

3. Restart frontend

The old direct API calls will work again.

## Next Steps

After successful migration, consider:

1. ✅ Add rate limiting
2. ✅ Add request caching
3. ✅ Add API analytics
4. ✅ Add request validation
5. ✅ Add API versioning
6. ✅ Add WebSocket support if needed



