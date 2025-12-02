# Scripts Directory

This directory contains utility scripts for the Double V project.

## Deployment Scripts

### `deploy-heroku.sh`
Deploys both Strapi and Predictive Service to Heroku using git subtree push.

**Usage:**
```bash
cd /Users/charena/Projects/double-v
./scripts/deploy-heroku.sh
```

**What it does:**
- Deploys Strapi to `double-v-strapi` Heroku app
- Deploys Predictive Service to `double-v-predictive` Heroku app
- Uses `git subtree push` to push only the relevant subdirectories

## Development Scripts

### `start-demo.sh`
Starts all local development services (Strapi, Predictive Service, Frontend).

**Usage:**
```bash
./scripts/start-demo.sh
```

**What it does:**
- Starts Strapi on http://localhost:1337
- Starts Predictive Service on http://localhost:8000
- Starts Next.js Frontend on http://localhost:3000
- Logs are written to `/tmp/*.log`

### `check-apis.sh`
Quick health check for all running services.

**Usage:**
```bash
./scripts/check-apis.sh
```

**What it checks:**
- Predictive Service health endpoint
- Strapi admin panel and API
- Frontend homepage

### `test-apis.sh`
Comprehensive API endpoint testing.

**Usage:**
```bash
./scripts/test-apis.sh
```

**What it tests:**
- All Strapi content type endpoints
- Predictive Service endpoints (forecast, risk, waterfall)
- Frontend pages

## Setup Scripts

### `setup-deployment.sh`
Verifies deployment configuration and checks for required secrets.

**Usage:**
```bash
./scripts/setup-deployment.sh
```

**What it checks:**
- GitHub secrets (Heroku API keys, Vercel tokens)
- Heroku app existence
- Vercel project linking

### `push-env-vars.sh`
Sets production environment variables on Heroku and provides instructions for Vercel.

**Usage:**
```bash
./scripts/push-env-vars.sh
```

**What it does:**
- Sets environment variables on Heroku Strapi app
- Sets environment variables on Heroku Predictive Service app
- Provides instructions for setting Vercel environment variables

## Utility Scripts

### `create-strapi-user.sh`
Creates a new Strapi user via API.

**Usage:**
```bash
./scripts/create-strapi-user.sh [email] [password] [username]
```

**Default values:**
- Email: `demo@example.com`
- Password: `DemoPassword123!`
- Username: `demo`

## Notes

- All scripts should be run from the project root directory (`/Users/charena/Projects/double-v`)
- Most scripts include color-coded output (green for success, red for errors, yellow for warnings)
- Scripts use `set -e` to exit on errors

