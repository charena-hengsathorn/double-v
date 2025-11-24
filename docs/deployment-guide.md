# Deployment Guide

## Overview

This guide covers deploying all three services:
1. **Strapi CMS** → Heroku
2. **Python Predictive Service** → Heroku
3. **Next.js Frontend** → Vercel

## Prerequisites

- GitHub repository set up
- Heroku account and CLI installed
- Vercel account and CLI installed
- GitHub Actions secrets configured

## Step 1: Set Up Heroku Apps

### Create Strapi App

```bash
cd project/strapi
heroku create double-v-strapi
heroku addons:create heroku-postgresql:mini
heroku config:set NODE_ENV=production
```

### Create Predictive Service App

```bash
cd project/predictive-service
heroku create double-v-predictive
heroku addons:create scheduler:standard
heroku config:set ENVIRONMENT=production
```

## Step 2: Configure Environment Variables

### Strapi Environment Variables

```bash
heroku config:set -a double-v-strapi \
  JWT_SECRET=$(openssl rand -base64 32) \
  ADMIN_JWT_SECRET=$(openssl rand -base64 32) \
  APP_KEYS=$(openssl rand -base64 32),$(openssl rand -base64 32),$(openssl rand -base64 32),$(openssl rand -base64 32) \
  API_TOKEN_SALT=$(openssl rand -base64 32) \
  TRANSFER_TOKEN_SALT=$(openssl rand -base64 32) \
  STRAPI_WEBHOOK_SECRET=$(openssl rand -base64 32)
```

Get database URL:
```bash
heroku config:get DATABASE_URL -a double-v-strapi
```

### Predictive Service Environment Variables

First, get your Strapi URL and create an API token in Strapi admin:

```bash
heroku config:set -a double-v-predictive \
  STRAPI_URL=https://double-v-strapi.herokuapp.com/api \
  STRAPI_API_TOKEN=your-strapi-api-token \
  STRAPI_WEBHOOK_SECRET=your-webhook-secret \
  CORS_ORIGINS=https://your-frontend.vercel.app
```

## Step 3: Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:

### Heroku Secrets
- `HEROKU_API_KEY` - Get from `heroku auth:token`
- `HEROKU_EMAIL` - Your Heroku email
- `HEROKU_STRAPI_APP_NAME` - `double-v-strapi`
- `HEROKU_PREDICTIVE_APP_NAME` - `double-v-predictive`

### Vercel Secrets
- `VERCEL_TOKEN` - Get from Vercel dashboard → Settings → Tokens
- `VERCEL_ORG_ID` - Get from Vercel dashboard
- `VERCEL_PROJECT_ID` - Get after creating project in Vercel

### Frontend Environment Variables (for build)
- `NEXT_PUBLIC_STRAPI_URL` - `https://double-v-strapi.herokuapp.com/api`
- `NEXT_PUBLIC_PREDICTIVE_SERVICE_URL` - `https://double-v-predictive.herokuapp.com/api/v1`
- `NEXT_PUBLIC_APP_URL` - Your Vercel app URL

## Step 4: Deploy to Heroku

### Manual Deployment (First Time)

#### Strapi
```bash
cd project/strapi
git subtree push --prefix project/strapi heroku main
```

Or use Heroku Git:
```bash
cd project/strapi
heroku git:remote -a double-v-strapi
git push heroku main
```

#### Predictive Service
```bash
cd project/predictive-service
heroku git:remote -a double-v-predictive
git push heroku main
```

### Automatic Deployment

After setting up GitHub Actions secrets, pushes to `main` will automatically deploy.

## Step 5: Deploy to Vercel

### Via CLI

```bash
cd project/frontend
vercel
```

Follow prompts and set environment variables.

### Via GitHub Integration

1. Go to Vercel dashboard
2. Import your GitHub repository
3. Set root directory to `project/frontend`
4. Configure environment variables
5. Deploy

## Step 6: Set Up Scheduled Jobs

### Heroku Scheduler (for nightly forecast recompute)

```bash
heroku addons:open scheduler -a double-v-predictive
```

Add job:
- **Schedule**: `0 2 * * *` (2 AM daily)
- **Run Command**: `curl -X POST https://double-v-predictive.herokuapp.com/api/v1/models/forecast/run -H "Authorization: Bearer $API_TOKEN"`

## Step 7: Configure Webhooks

### Strapi → Predictive Service

1. Go to Strapi admin panel
2. Settings → Webhooks
3. Create webhook:
   - **Name**: Forecast Recompute
   - **URL**: `https://double-v-predictive.herokuapp.com/api/v1/models/forecast/run`
   - **Events**: Entry create, Entry update (for pipeline-deals)
   - **Headers**: 
     - `Authorization: Bearer <your-api-token>`
     - `X-Strapi-Event: entry.update`
     - `X-Strapi-Signature: <hmac-signature>`

## Step 8: Verify Deployments

### Health Checks

```bash
# Strapi
curl https://double-v-strapi.herokuapp.com/_health

# Predictive Service
curl https://double-v-predictive.herokuapp.com/api/v1/health

# Frontend
curl https://your-app.vercel.app
```

## Troubleshooting

### Heroku Deployment Issues

- Check logs: `heroku logs --tail -a <app-name>`
- Verify environment variables: `heroku config -a <app-name>`
- Check buildpack: `heroku buildpacks -a <app-name>`

### Vercel Deployment Issues

- Check build logs in Vercel dashboard
- Verify environment variables are set
- Check Next.js build output

### Connection Issues

- Verify CORS settings in predictive service
- Check API URLs in frontend environment variables
- Verify API tokens are valid

## Monitoring

- **Heroku**: Use Heroku Metrics and Logs
- **Vercel**: Use Vercel Analytics
- **Application**: Set up error tracking (Sentry, etc.)

## Rollback

### Heroku
```bash
heroku releases -a <app-name>
heroku rollback <release-number> -a <app-name>
```

### Vercel
Use Vercel dashboard to rollback to previous deployment.

