# Double V Project Stack Explanation

## Architecture Overview

This is a **microservices architecture** with 4 main components:

### 1. **Frontend (Next.js)** - Deployed on Vercel
- **Technology**: Next.js 14 (React framework)
- **Location**: `project/frontend/`
- **Deployment**: Vercel (automatic from Git pushes)
- **URL**: Production URL from Vercel dashboard
- **Purpose**: User interface and API proxy layer
- **Key Features**:
  - Server-side rendering (SSR)
  - API routes (`/api/*`) that proxy to backend services
  - Dashboard, Cashflow, Sales, and Billing management interfaces

### 2. **Backend CMS (Strapi)** - Deployed on Heroku
- **Technology**: Strapi v4 (Node.js/TypeScript)
- **Location**: `project/strapi/`
- **Deployment**: Heroku (`double-v-strapi`)
- **URL**: `https://double-v-strapi.herokuapp.com` (or similar)
- **Purpose**: Content Management System for storing business data
- **Content Types**:
  - Sales entries
  - Billings/Payments
  - Clients
  - Projects
  - Pipeline deals
  - Forecast snapshots
  - Risk flags
  - User profiles
- **Database**: Configured via Heroku add-ons (PostgreSQL typically)

### 3. **Predictive Service (FastAPI)** - Deployed on Heroku
- **Technology**: Python FastAPI
- **Location**: `project/predictive-service/`
- **Deployment**: Heroku (`double-v-predictive`)
- **URL**: `https://double-v-predictive.herokuapp.com` (or similar)
- **Purpose**: Machine learning predictions and analytics
- **Features**:
  - Forecast calculations
  - Risk heatmaps
  - Monte Carlo simulations
  - Probability modeling

### 4. **API Server (Node.js/Express)** - Optional, for local dev
- **Technology**: Node.js + Express + TypeScript
- **Location**: `project/api-server/`
- **Purpose**: Centralized API gateway (mainly for local development)
- **Note**: May or may not be deployed separately in production

---

## How Services Start on Heroku Production

### Heroku Deployment Process

Heroku services **start automatically** when you deploy code. Here's how:

#### 1. **Strapi Backend (double-v-strapi)**

**Deployment:**
```bash
# From project root
cd project/strapi
git subtree push --prefix project/strapi heroku-strapi main
```

**How it starts:**
- Heroku reads `project/strapi/Procfile` which contains: `web: npm start`
- This runs `npm start` which executes the Strapi build and starts the server
- Strapi listens on the port provided by Heroku (`$PORT` environment variable)
- Service is available at: `https://double-v-strapi.herokuapp.com`

**Current Status:** ✅ Running (up ~19h ago)

#### 2. **Predictive Service (double-v-predictive)**

**Deployment:**
```bash
# From project root
cd project/predictive-service
git subtree push --prefix project/predictive-service heroku-predictive main
```

**How it starts:**
- Heroku reads `project/predictive-service/Procfile` which contains:
  ```
  web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
  ```
- This starts the FastAPI application using Uvicorn
- Service is available at: `https://double-v-predictive.herokuapp.com`

**Current Status:** ✅ Running (up ~2h ago)

#### 3. **Frontend (Next.js) - Vercel**

**Deployment:**
```bash
# From project root
vercel --prod
```

**How it starts:**
- Vercel automatically detects Next.js configuration
- Builds the application (`next build`)
- Deploys to CDN with serverless functions
- API routes (`/api/*`) run as serverless functions

---

## Local Development vs Production

### Local Development (`./start-demo.sh`)

The `start-demo.sh` script is **only for local development**. It:

1. Starts Strapi on `http://localhost:1337`
2. Starts Predictive Service on `http://localhost:8000`
3. Starts Next.js Frontend on `http://localhost:3000`
4. (Optional) Starts API Server on `http://localhost:4000`

**Usage:**
```bash
./start-demo.sh
```

### Production (Heroku + Vercel)

**Services run automatically:**

1. **Heroku Services:**
   - Automatically start when code is deployed
   - Run continuously (dynos stay alive)
   - Restart automatically if they crash
   - Scale based on your Heroku plan

2. **Vercel Frontend:**
   - Automatically builds and deploys on Git push
   - Runs as serverless functions
   - Scales automatically

---

## Checking Service Status

### Heroku Services

```bash
# Check Strapi status
heroku ps --app double-v-strapi

# Check Predictive Service status
heroku ps --app double-v-predictive

# View logs
heroku logs --tail --app double-v-strapi
heroku logs --tail --app double-v-predictive

# Restart services (if needed)
heroku restart --app double-v-strapi
heroku restart --app double-v-predictive
```

### Vercel Frontend

```bash
# Check deployments
vercel ls

# View logs
vercel logs

# Check production URL
vercel inspect [deployment-url]
```

---

## Environment Variables

Each service needs different environment variables:

### Strapi (Heroku)
- Set via: `heroku config:set KEY=value --app double-v-strapi`
- Database URL (automatically set by Heroku Postgres add-on)
- JWT secrets
- Admin panel credentials

### Predictive Service (Heroku)
- Set via: `heroku config:set KEY=value --app double-v-predictive`
- Strapi URL
- Database connections
- API keys

### Frontend (Vercel)
- Set via Vercel dashboard or `vercel env add`
- `NEXT_PUBLIC_STRAPI_URL` - Points to Heroku Strapi
- `NEXT_PUBLIC_PREDICTIVE_SERVICE_URL` - Points to Heroku Predictive Service
- Other public environment variables

---

## Key Differences: Local vs Production

| Aspect | Local Development | Production |
|--------|------------------|------------|
| **Strapi URL** | `http://localhost:1337` | `https://double-v-strapi.herokuapp.com` |
| **Predictive URL** | `http://localhost:8000` | `https://double-v-predictive.herokuapp.com` |
| **Frontend URL** | `http://localhost:3000` | Vercel production URL |
| **Startup** | Manual (`./start-demo.sh`) | Automatic (on deploy) |
| **Database** | Local SQLite/Postgres | Heroku Postgres |
| **Scaling** | Single instance | Auto-scaling (Heroku dynos) |
| **Logs** | Terminal output | `heroku logs` / Vercel dashboard |

---

## Quick Reference: Deployment Commands

### Deploy to Heroku

```bash
# Deploy Strapi
cd project/strapi
git subtree push --prefix project/strapi heroku-strapi main

# Deploy Predictive Service
cd project/predictive-service
git subtree push --prefix project/predictive-service heroku-predictive main
```

### Deploy to Vercel

```bash
# From project root
vercel --prod
```

### Deploy Everything

```bash
# 1. Commit changes
git add -A
git commit -m "Your message"
git push origin main

# 2. Deploy to Heroku
cd project/strapi && git subtree push --prefix project/strapi heroku-strapi main && cd ../..
cd project/predictive-service && git subtree push --prefix project/predictive-service heroku-predictive main && cd ../..

# 3. Deploy to Vercel (or it auto-deploys on git push if connected)
vercel --prod
```

---

## Important Notes

1. **Heroku services run 24/7** - They don't need manual starting
2. **Vercel deploys automatically** - If connected to Git, it deploys on push
3. **Environment variables must match** - Frontend must point to correct backend URLs
4. **CORS must be configured** - Strapi and Predictive Service must allow requests from Vercel domain
5. **Database migrations** - Strapi handles these automatically on startup

