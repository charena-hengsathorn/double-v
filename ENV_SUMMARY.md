# Environment Variables Summary

## Quick Reference

All services now use **`.env.local`** files for local development (standardized approach).

### Current Status

✅ **Standardized to `.env.local`**
- Frontend: Uses `.env.local` (Next.js default)
- API Server: Uses `.env.local` (updated dotenv config)
- Strapi: Uses `.env.local` (Strapi default)
- Predictive Service: Uses `.env.local` (updated dotenv config)

### File Locations

```
project/
├── frontend/.env.local
├── api-server/.env.local
├── strapi/.env.local
└── predictive-service/.env.local
```

## Setup Commands

### 1. Create all .env.local files from templates:
```bash
./scripts/setup-env-local.sh
```

### 2. Check if environment variables are loaded:
```bash
./scripts/check-env-vars.sh
```

## Key Environment Variables

### Frontend (Next.js)
- `NEXT_PUBLIC_API_SERVER_URL` - API server URL (http://localhost:4000)
- `NEXT_PUBLIC_STRAPI_URL` - Strapi URL (if using directly)
- `NEXT_PUBLIC_PREDICTIVE_SERVICE_URL` - Predictive service URL (if using directly)

### API Server
- `PORT` - Server port (4000)
- `STRAPI_URL` - Strapi backend URL
- `PREDICTIVE_SERVICE_URL` - Predictive service URL
- `CORS_ORIGINS` - Allowed CORS origins

### Strapi
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `APP_KEYS` - Strapi application keys

### Predictive Service
- `STRAPI_URL` - Strapi API URL
- `STRAPI_API_TOKEN` - API token for Strapi
- `CORS_ORIGINS` - Allowed CORS origins

## Loading Priority

Each service loads environment variables in this order:
1. System environment variables (highest priority)
2. `.env.local` (local development)
3. `.env` (fallback)
4. Default values in code

## Documentation

- **Full Guide**: See [ENV_SETUP_GUIDE.md](./ENV_SETUP_GUIDE.md)
- **Service-specific**: Check `env.example` files in each service directory

## Quick Troubleshooting

**Variables not loading?**
- Check file name: Must be `.env.local` (not `.env.local.txt`)
- Check location: Must be in service root directory
- Restart service: Variables loaded on startup

**Frontend variables not available?**
- Must start with `NEXT_PUBLIC_` prefix
- Restart dev server after changes

