# Complete Deployment Guide

## 🚀 Quick Deploy (All at Once)

Run the automated deployment script:

```bash
./scripts/deploy-all.sh
```

This will guide you through:
1. ✅ Git commit & push
2. ✅ Heroku Strapi deployment
3. ✅ Heroku Predictive Service deployment
4. ✅ Vercel Frontend deployment

---

## 📋 Manual Deployment Steps

### Step 1: Commit & Push to Git

```bash
cd /Users/charena/Projects/double-v

# Check status
git status

# Add all changes
git add .

# Commit
git commit -m "Deploy: Add API server, fix auth, update env config"

# Push
git push origin main
```

### Step 2: Deploy Strapi to Heroku

```bash
# Method 1: Using git subtree (if remote exists)
git subtree push --prefix project/strapi heroku-strapi main

# Method 2: First time setup
cd project/strapi
heroku git:remote -a double-v-strapi -r heroku-strapi
cd ../..
git subtree push --prefix project/strapi heroku-strapi main

# Method 3: Direct Heroku CLI
cd project/strapi
heroku git:remote -a double-v-strapi
git push heroku-strapi main:main
```

**After deployment:**
- Heroku will automatically build and deploy
- Check logs: `heroku logs --tail -a double-v-strapi`

### Step 3: Deploy Predictive Service to Heroku

```bash
# Method 1: Using git subtree
git subtree push --prefix project/predictive-service heroku-predictive main

# Method 2: First time setup
cd project/predictive-service
heroku git:remote -a double-v-predictive -r heroku-predictive
cd ../..
git subtree push --prefix project/predictive-service heroku-predictive main

# Method 3: Direct Heroku CLI
cd project/predictive-service
heroku git:remote -a double-v-predictive
git push heroku-predictive main:main
```

**After deployment:**
- Check logs: `heroku logs --tail -a double-v-predictive`

### Step 4: Deploy Frontend to Vercel

**Option A: Using Vercel CLI**

```bash
cd project/frontend

# Install Vercel CLI if needed
npm i -g vercel

# Deploy
vercel --prod
```

**Option B: GitHub Integration (Automatic)**

1. Go to: https://vercel.com/dashboard
2. Import your GitHub repository
3. Configure:
   - Root Directory: `project/frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`
4. Add environment variables:
   - `NEXT_PUBLIC_STRAPI_URL` → Production Strapi URL
   - `NEXT_PUBLIC_PREDICTIVE_SERVICE_URL` → Production Predictive URL
   - `NEXT_PUBLIC_APP_URL` → Your Vercel app URL
5. Deploy - Vercel will auto-deploy on every push to main

---

## 🔧 Setting Up Heroku Remotes (First Time)

If you haven't set up Heroku remotes yet:

### Strapi

```bash
# Create or connect to Heroku app
heroku git:remote -a double-v-strapi -r heroku-strapi

# Or create new app
heroku create double-v-strapi -r heroku-strapi
```

### Predictive Service

```bash
# Create or connect to Heroku app
heroku git:remote -a double-v-predictive -r heroku-predictive

# Or create new app
heroku create double-v-predictive -r heroku-predictive
```

---

## 🌍 Environment Variables for Production

### Set Heroku Environment Variables

**Strapi:**
```bash
heroku config:set -a double-v-strapi \
  DATABASE_URL=$(heroku config:get DATABASE_URL -a double-v-strapi) \
  NODE_ENV=production \
  STRAPI_URL=https://double-v-strapi-dd98523889e0.herokuapp.com \
  FRONTEND_URL=https://double-v-frontend.vercel.app \
  PREDICTIVE_SERVICE_URL=https://double-v-predictive-10a3079347ff.herokuapp.com
```

**Predictive Service:**
```bash
heroku config:set -a double-v-predictive \
  STRAPI_URL=https://double-v-strapi-dd98523889e0.herokuapp.com/api \
  CORS_ORIGINS=https://double-v-frontend.vercel.app \
  ENVIRONMENT=production \
  LOG_LEVEL=INFO
```

**Or use the script:**
```bash
./scripts/push-env-vars.sh
```

### Set Vercel Environment Variables

**Using Vercel CLI:**
```bash
cd project/frontend

vercel env add NEXT_PUBLIC_STRAPI_URL production
# Enter: https://double-v-strapi-dd98523889e0.herokuapp.com/api

vercel env add NEXT_PUBLIC_PREDICTIVE_SERVICE_URL production
# Enter: https://double-v-predictive-10a3079347ff.herokuapp.com/api/v1

vercel env add NEXT_PUBLIC_APP_URL production
# Enter: https://your-app.vercel.app
```

**Using Vercel Dashboard:**
1. Go to: https://vercel.com/your-project/settings/environment-variables
2. Add each variable for "Production" environment
3. Redeploy after adding variables

---

## ✅ Verification After Deployment

### Check Strapi

```bash
# Check if app is running
curl https://double-v-strapi-dd98523889e0.herokuapp.com/api

# Check logs
heroku logs --tail -a double-v-strapi
```

### Check Predictive Service

```bash
# Health check
curl https://double-v-predictive-10a3079347ff.herokuapp.com/api/v1/health

# Check logs
heroku logs --tail -a double-v-predictive
```

### Check Frontend

```bash
# Visit your Vercel URL
# Or check deployment status
vercel ls
```

---

## 📝 Pre-Deployment Checklist

Before deploying:

- [ ] All local changes committed
- [ ] Tests pass (if any)
- [ ] Environment variables configured
- [ ] Production URLs updated (not localhost)
- [ ] Heroku apps created and configured
- [ ] Database migrations run (if any)
- [ ] Content types registered in Strapi

---

## 🐛 Troubleshooting

### Heroku Deployment Issues

**Build fails:**
- Check build logs: `heroku logs --tail -a <app-name>`
- Verify `package.json` has correct scripts
- Check Node.js version in `package.json` matches Heroku

**App crashes:**
- Check runtime logs: `heroku logs --tail -a <app-name>`
- Verify environment variables are set
- Check database connection

### Vercel Deployment Issues

**Build fails:**
- Check build logs in Vercel dashboard
- Verify `next.config.js` is correct
- Check environment variables are set

**404 errors:**
- Verify routes are in `app/` directory (App Router)
- Check `vercel.json` configuration

---

## 🚀 Quick Deploy Commands

```bash
# All-in-one script
./scripts/deploy-all.sh

# Or manually:

# 1. Git
git add . && git commit -m "Deploy updates" && git push

# 2. Heroku Strapi
git subtree push --prefix project/strapi heroku-strapi main

# 3. Heroku Predictive
git subtree push --prefix project/predictive-service heroku-predictive main

# 4. Vercel
cd project/frontend && vercel --prod
```

---

## 📚 Additional Resources

- `scripts/push-env-vars.sh` - Set environment variables
- `docs/deployment-guide.md` - Detailed deployment docs
- `README.md` - Project overview


