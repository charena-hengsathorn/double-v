# 🚀 Deploy Now - Quick Guide

## ✅ Everything is Ready!

Your Heroku remotes are already configured:
- ✅ `heroku-strapi` → double-v-strapi
- ✅ `heroku-predictive` → double-v-predictive
- ✅ `origin` → GitHub repository

## ⚡ Quick Deploy (One Command)

```bash
./scripts/quick-deploy.sh
```

This will:
1. ✅ Commit all changes to git
2. ✅ Push to GitHub
3. ✅ Deploy Strapi to Heroku
4. ✅ Deploy Predictive Service to Heroku
5. ✅ Deploy Frontend to Vercel (if CLI installed)

## 📋 Manual Steps (If You Prefer)

### 1. Git Commit & Push

```bash
cd /Users/charena/Projects/double-v

# Add all changes
git add .

# Commit
git commit -m "Deploy: Add API server, fix auth, update env config"

# Push
git push origin main
```

### 2. Deploy Strapi to Heroku

```bash
git subtree push --prefix project/strapi heroku-strapi main
```

### 3. Deploy Predictive Service to Heroku

```bash
git subtree push --prefix project/predictive-service heroku-predictive main
```

### 4. Deploy Frontend to Vercel

**Option A: Vercel CLI**
```bash
cd project/frontend
vercel --prod
```

**Option B: Auto-deploy (if connected to GitHub)**
- Just push to GitHub and Vercel will auto-deploy!

## 🌍 After Deployment

### Verify Services

**Strapi:**
```bash
curl https://double-v-strapi-dd98523889e0.herokuapp.com/api
```

**Predictive Service:**
```bash
curl https://double-v-predictive-10a3079347ff.herokuapp.com/api/v1/health
```

**Frontend:**
- Visit your Vercel URL (check Vercel dashboard)

### Check Deployment Status

```bash
# Strapi logs
heroku logs --tail -a double-v-strapi

# Predictive logs
heroku logs --tail -a double-v-predictive

# Vercel deployments
vercel ls
```

## ⚙️ Environment Variables

Make sure production environment variables are set:

**Strapi (Heroku):**
```bash
heroku config -a double-v-strapi
```

**Predictive (Heroku):**
```bash
heroku config -a double-v-predictive
```

**Frontend (Vercel):**
- Check in Vercel dashboard or:
```bash
vercel env ls
```

## 🎯 Ready to Deploy?

Run:
```bash
./scripts/quick-deploy.sh
```

That's it! 🚀

