# Environment Variables Setup Guide

This guide explains how environment variables are organized and used across all services in the Double V project.

## 📁 Environment File Structure

All services use `.env.local` for **local development** (git-ignored). Each service has an `env.example` file as a template.

```
project/
├── frontend/
│   ├── .env.local          # Local development (git-ignored)
│   └── env.example         # Template
├── api-server/
│   ├── .env.local          # Local development (git-ignored)
│   └── env.example         # Template
├── strapi/
│   ├── .env.local          # Local development (git-ignored)
│   └── env.example         # Template
└── predictive-service/
    ├── .env.local          # Local development (git-ignored)
    └── env.example         # Template
```

## 🔄 Environment Variable Loading Priority

Each service loads environment variables in this order (highest priority first):

1. **System environment variables** (set in shell)
2. **`.env.local`** (local development, git-ignored)
3. **`.env`** (fallback, git-ignored)
4. **Default values** (hardcoded in code)

## 📋 Service-Specific Configuration

### Frontend (Next.js)

**File**: `project/frontend/.env.local`

```env
# Public variables (exposed to browser - must start with NEXT_PUBLIC_)
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337/api
NEXT_PUBLIC_PREDICTIVE_SERVICE_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_API_SERVER_URL=http://localhost:4000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Server-side only (no NEXT_PUBLIC_ prefix)
# These are only available in API routes and server components
```

**Note**: Next.js automatically loads `.env.local` and makes `NEXT_PUBLIC_*` variables available to the browser.

### API Server (Node.js/Express)

**File**: `project/api-server/.env.local`

```env
PORT=4000
NODE_ENV=development

# Backend Service URLs
STRAPI_URL=http://localhost:1337
PREDICTIVE_SERVICE_URL=http://localhost:8000

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

**Loading**: Uses `dotenv.config()` which loads `.env.local` automatically.

### Strapi CMS

**File**: `project/strapi/.env.local`

```env
HOST=0.0.0.0
PORT=1337
NODE_ENV=development

# Strapi Secrets (generate unique values)
APP_KEYS=your-app-keys-here
API_TOKEN_SALT=your-api-token-salt-here
ADMIN_JWT_SECRET=your-admin-jwt-secret-here
JWT_SECRET=your-jwt-secret-here
TRANSFER_TOKEN_SALT=your-transfer-token-salt-here

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/strapi

# URLs
STRAPI_URL=http://localhost:1337
FRONTEND_URL=http://localhost:3000
PREDICTIVE_SERVICE_URL=http://localhost:8000
```

**Loading**: Strapi automatically loads `.env.local` if present.

### Predictive Service (Python/FastAPI)

**File**: `project/predictive-service/.env.local`

```env
ENVIRONMENT=development
LOG_LEVEL=INFO
PORT=8000

# Strapi Integration
STRAPI_URL=http://localhost:1337/api
STRAPI_API_TOKEN=your-strapi-api-token-here
STRAPI_WEBHOOK_SECRET=your-webhook-secret-here

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Model Configuration
MODEL_VERSION=1.0.0
MONTE_CARLO_ITERATIONS=10000
FORECAST_HORIZON_MONTHS=12
```

**Loading**: Uses `python-dotenv` with `load_dotenv('.env.local')`.

## 🚀 Quick Setup

### 1. Copy Example Files

```bash
# Frontend
cd project/frontend
cp env.example .env.local

# API Server
cd project/api-server
cp env.example .env.local

# Strapi
cd project/strapi
cp env.example .env.local

# Predictive Service
cd project/predictive-service
cp env.example .env.local
```

### 2. Fill in Your Values

Edit each `.env.local` file with your actual values (especially secrets and database URLs).

### 3. Verify Environment Variables

```bash
# Check if variables are loaded (Node.js)
node -e "require('dotenv').config({ path: '.env.local' }); console.log(process.env.PORT)"

# Check if variables are loaded (Python)
python -c "from dotenv import load_dotenv; import os; load_dotenv('.env.local'); print(os.getenv('PORT'))"
```

## 🔍 Checking Environment Variable Usage

### Frontend (Next.js)

Next.js automatically makes `NEXT_PUBLIC_*` variables available in the browser:

```typescript
// In component
const apiUrl = process.env.NEXT_PUBLIC_API_SERVER_URL;
```

### API Server

```typescript
// In server.ts
dotenv.config({ path: '.env.local' });
const PORT = process.env.PORT;
```

### Strapi

Strapi automatically loads `.env.local` on startup.

### Predictive Service

```python
# In main.py
from dotenv import load_dotenv
load_dotenv('.env.local')  # or load_dotenv() which tries .env.local first
```

## 📝 Environment Variable Checklist

When setting up a new environment, ensure:

- [ ] All `.env.local` files created from `env.example`
- [ ] Database URLs configured correctly
- [ ] API tokens/secrets generated and set
- [ ] CORS origins include all needed frontend URLs
- [ ] Service URLs point to correct ports/hosts
- [ ] `NEXT_PUBLIC_*` prefix used for frontend browser variables

## 🔐 Security Best Practices

1. **Never commit `.env.local` files** - They're git-ignored
2. **Use strong secrets** - Generate with: `openssl rand -base64 32`
3. **Rotate secrets regularly** - Especially in production
4. **Use different secrets** - Each environment (dev/staging/prod) should have unique values
5. **Limit `NEXT_PUBLIC_*` variables** - Only expose what's necessary to the browser

## 🌍 Production Environment Variables

For production deployments:

- **Heroku**: Set via `heroku config:set KEY=value`
- **Vercel**: Set via dashboard or `vercel env add KEY`
- **Docker**: Pass via `-e` flags or `.env` file

See `scripts/push-env-vars.sh` for example production setup.

## 🐛 Troubleshooting

### Variables not loading?

1. Check file name: Must be `.env.local` (not `.env.local.txt`)
2. Check file location: Must be in service root directory
3. Check syntax: No spaces around `=` sign
4. Restart service: Environment variables loaded on startup

### Wrong values?

1. Check priority: System env > `.env.local` > `.env` > defaults
2. Check for typos: Variable names are case-sensitive
3. Check file encoding: Use UTF-8

### Frontend variables not available?

1. Must start with `NEXT_PUBLIC_` prefix
2. Must be in `.env.local` or set at build time
3. Restart dev server after changes

## 📚 Additional Resources

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Node.js dotenv](https://github.com/motdotla/dotenv)
- [Python-dotenv](https://pypi.org/project/python-dotenv/)
- [Strapi Environment Variables](https://docs.strapi.io/dev-docs/configurations/environment)


