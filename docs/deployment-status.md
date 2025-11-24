# Deployment Status

## ✅ Completed

### Git & GitHub
- ✅ Git repository initialized
- ✅ GitHub repository created: `https://github.com/charena-hengsathorn/double-v`
- ✅ Code pushed to `main` branch

### Heroku Apps Created
- ✅ **Strapi App**: `double-v-strapi`
  - URL: `https://double-v-strapi-dd98523889e0.herokuapp.com`
  - Git: `https://git.heroku.com/double-v-strapi.git`
  - PostgreSQL addon: `heroku-postgresql:essential-0` ($5/month)

- ✅ **Predictive Service App**: `double-v-predictive`
  - URL: `https://double-v-predictive-10a3079347ff.herokuapp.com`
  - Git: `https://git.heroku.com/double-v-predictive.git`
  - Scheduler addon: `scheduler:standard` (free)

### Environment Variables Configured

#### Strapi (`double-v-strapi`)
- ✅ `NODE_ENV=production`
- ✅ `JWT_SECRET` (generated)
- ✅ `ADMIN_JWT_SECRET` (generated)
- ✅ `APP_KEYS` (4 keys generated)
- ✅ `API_TOKEN_SALT` (generated)
- ✅ `TRANSFER_TOKEN_SALT` (generated)
- ✅ `STRAPI_WEBHOOK_SECRET` (generated)
- ✅ `DATABASE_URL` (auto-set by Heroku Postgres addon)

#### Predictive Service (`double-v-predictive`)
- ✅ `ENVIRONMENT=production`
- ✅ `STRAPI_URL=https://double-v-strapi-dd98523889e0.herokuapp.com/api`
- ✅ `STRAPI_WEBHOOK_SECRET` (generated)
- ✅ `CORS_ORIGINS=https://double-v-frontend.vercel.app,http://localhost:3000`

### Vercel
- ✅ Vercel CLI authenticated as `charenas-projects`
- ✅ Project created: `frontend`
- ✅ Project ID: `prj_fbDwMFTU4TY3kR1F4uJxFvDgmePF`
- ✅ Org ID: `team_znfWLFKFRbVqjbqoZ1C1qI40`
- ✅ Project linked locally
- ⚠️ Deployment will work once frontend is scaffolded (no package.json yet)

### Heroku API Token
- ✅ Token generated (stored locally, not in repo)
- ⚠️ Token expires: Saturday at 7:19 PM
- 💡 For long-term: `heroku authorizations:create`
- 💡 Get current token: `heroku auth:token`

## 🔲 Remaining Steps

### 1. Configure GitHub Secrets (Required for CI/CD)

Go to: `https://github.com/charena-hengsathorn/double-v/settings/secrets/actions`

Add these secrets:

**Heroku:**
- `HEROKU_API_KEY` = (Get with: `heroku auth:token`)
- `HEROKU_EMAIL` = `charenah@gmail.com`
- `HEROKU_STRAPI_APP_NAME` = `double-v-strapi`
- `HEROKU_PREDICTIVE_APP_NAME` = `double-v-predictive`

**Vercel:**
- `VERCEL_TOKEN` = (Get from Vercel dashboard → Settings → Tokens)
- `VERCEL_ORG_ID` = `team_znfWLFKFRbVqjbqoZ1C1qI40`
- `VERCEL_PROJECT_ID` = `prj_fbDwMFTU4TY3kR1F4uJxFvDgmePF`

**Frontend Environment Variables (for build):**
- `NEXT_PUBLIC_STRAPI_URL` = `https://double-v-strapi-dd98523889e0.herokuapp.com/api`
- `NEXT_PUBLIC_PREDICTIVE_SERVICE_URL` = `https://double-v-predictive-10a3079347ff.herokuapp.com/api/v1`
- `NEXT_PUBLIC_APP_URL` = (Will be set after Vercel deployment)

### 2. Scaffold Services (AI Execution Plan Phase 2-4)

Once services are scaffolded:
- Strapi project in `project/strapi/`
- Python service in `project/predictive-service/`
- Next.js app in `project/frontend/`

### 3. Deploy Services

**Strapi:**
```bash
cd project/strapi
git subtree push --prefix project/strapi heroku main
# Or use GitHub Actions (automatic after secrets configured)
```

**Predictive Service:**
```bash
cd project/predictive-service
git subtree push --prefix project/predictive-service heroku main
# Or use GitHub Actions (automatic after secrets configured)
```

**Frontend:**
```bash
cd project/frontend
vercel --prod
# Or connect GitHub repo to Vercel for automatic deployments
```

### 4. Configure Strapi API Token

After Strapi is deployed:
1. Go to Strapi admin: `https://double-v-strapi-dd98523889e0.herokuapp.com/admin`
2. Create admin user
3. Go to Settings → API Tokens
4. Create token for Predictive Service
5. Set `STRAPI_API_TOKEN` in `double-v-predictive` Heroku app

### 5. Set Up Webhooks

After both services are deployed:
1. Go to Strapi admin → Settings → Webhooks
2. Create webhook to: `https://double-v-predictive-10a3079347ff.herokuapp.com/api/v1/models/forecast/run`
3. Configure events: Entry create, Entry update (for pipeline-deals)

### 6. Configure Heroku Scheduler

For nightly forecast recompute:
```bash
heroku addons:open scheduler -a double-v-predictive
```
Add job:
- Schedule: `0 2 * * *` (2 AM daily)
- Run Command: `curl -X POST https://double-v-predictive-10a3079347ff.herokuapp.com/api/v1/models/forecast/run`

## 📋 Quick Reference

### App URLs
- **Strapi**: https://double-v-strapi-dd98523889e0.herokuapp.com
- **Predictive Service**: https://double-v-predictive-10a3079347ff.herokuapp.com
- **Frontend**: https://double-v-frontend-7isjftllj-charenas-projects.vercel.app (will update after proper deployment)

### Heroku Commands
```bash
# View logs
heroku logs --tail -a double-v-strapi
heroku logs --tail -a double-v-predictive

# View config
heroku config -a double-v-strapi
heroku config -a double-v-predictive

# Open dashboard
heroku open -a double-v-strapi
heroku open -a double-v-predictive
```

### Vercel Commands
```bash
# View deployments
vercel ls

# View logs
vercel logs

# Open dashboard
vercel inspect
```

## 🎯 Next Steps

1. **Configure GitHub Secrets** (5 minutes)
2. **Start AI Execution Plan** - Phase 2: Environment Provisioning
3. **Scaffold Services** - AI will create the actual projects
4. **Deploy** - Services will deploy automatically via CI/CD or manually

## ⚠️ Notes

- Heroku API token expires Saturday at 7:19 PM - generate a new one with `heroku authorizations:create` for long-term use
- Frontend deployment will work once Next.js project is scaffolded
- All environment variables are set except `STRAPI_API_TOKEN` (needs to be created in Strapi admin after deployment)
- Webhooks and scheduled jobs can be configured after services are deployed and running

