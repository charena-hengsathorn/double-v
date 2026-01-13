# Heroku CLI Deployment Guide

This guide explains how to deploy to Heroku using the CLI instead of GitHub Actions.

## Prerequisites

1. **Heroku CLI installed and authenticated**
   ```bash
   heroku login
   ```

2. **Git remotes configured** (already done)
   - Strapi: `heroku` remote in `project/strapi/`
   - Predictive Service: `heroku` remote in `project/predictive-service/`

## Deployment Methods

### Method 1: Using the Deployment Script (Recommended)

```bash
cd /Users/charena/Projects/double-v
./scripts/deploy-heroku.sh
```

This script will:
- Check authentication
- Deploy Strapi to `double-v-strapi`
- Deploy Predictive Service to `double-v-predictive`

### Method 2: Manual Deployment

#### Deploy Strapi:
```bash
cd project/strapi
heroku git:remote -a double-v-strapi
git push heroku main
```

#### Deploy Predictive Service:
```bash
cd project/predictive-service
heroku git:remote -a double-v-predictive
git push heroku main
```

### Method 3: Using Git Subtree from Root

If you prefer to deploy from the root directory:

```bash
# From project root
cd /Users/charena/Projects/double-v

# Deploy Strapi
git subtree push --prefix project/strapi heroku-strapi main

# Deploy Predictive Service
git subtree push --prefix project/predictive-service heroku-predictive main
```

## Current Configuration

### Git Remotes

**Root directory:**
- `heroku-strapi` → `https://git.heroku.com/double-v-strapi.git`
- `heroku-predictive` → `https://git.heroku.com/double-v-predictive.git`

**Strapi directory (`project/strapi/`):**
- `heroku` → Set via `heroku git:remote -a double-v-strapi`

**Predictive Service directory (`project/predictive-service/`):**
- `heroku` → Set via `heroku git:remote -a double-v-predictive`

## Troubleshooting

### Authentication Issues

If you get authentication errors:

1. **Refresh Heroku login:**
   ```bash
   heroku login
   ```

2. **Check authentication:**
   ```bash
   heroku auth:whoami
   ```

3. **If using SSH keys, ensure they're added to Heroku:**
   ```bash
   heroku keys:add ~/.ssh/id_rsa.pub
   ```

### Git Push Issues

If `git push heroku main` fails:

1. **Ensure you're in the correct subdirectory:**
   ```bash
   cd project/strapi  # or project/predictive-service
   ```

2. **Verify the remote:**
   ```bash
   git remote -v
   ```

3. **Re-setup the remote:**
   ```bash
   heroku git:remote -a double-v-strapi
   # or
   heroku git:remote -a double-v-predictive
   ```

### App Name Issues

If the app names are different, check your actual app names:

```bash
heroku apps
```

Then update the remotes:
```bash
heroku git:remote -a YOUR_ACTUAL_APP_NAME
```

## Automatic Deployment

Once configured, you can deploy by simply running:

```bash
# From project root
./scripts/deploy-heroku.sh
```

Or manually from each subdirectory:

```bash
cd project/strapi && git push heroku main
cd ../predictive-service && git push heroku main
```

## Next Steps

After deployment:

1. **Check app status:**
   ```bash
   heroku ps -a double-v-strapi
   heroku ps -a double-v-predictive
   ```

2. **View logs:**
   ```bash
   heroku logs --tail -a double-v-strapi
   heroku logs --tail -a double-v-predictive
   ```

3. **Verify deployment:**
   - Strapi: https://double-v-strapi.herokuapp.com
   - Predictive Service: https://double-v-predictive.herokuapp.com




