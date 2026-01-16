# Deployment Links

Complete list of all deployment and service links for the Double V project.

---

## 📦 Git / GitHub

### Repository
- **GitHub Repository**: https://github.com/charena-hengsathorn/double-v
- **Repository SSH**: git@github.com:charena-hengsathorn/double-v.git
- **Repository HTTPS**: https://github.com/charena-hengsathorn/double-v.git

### Git Remotes
- **origin** (GitHub): https://github.com/charena-hengsathorn/double-v.git
- **heroku-strapi**: https://git.heroku.com/double-v-strapi.git
- **heroku-predictive**: https://git.heroku.com/double-v-predictive.git

---

## 🚀 Vercel (Frontend)

### Production URLs
- **Production Frontend**: https://frontend-ni46sn02m-charenas-projects.vercel.app
- **Vercel Dashboard**: https://vercel.com/charenas-projects/frontend
- **Project Inspect**: https://vercel.com/charenas-projects/frontend

### Deployment
- **Auto-deploy**: Enabled via GitHub integration
- **Manual deploy**: `cd project/frontend && vercel --prod`

---

## ☁️ Heroku

### Strapi (CMS Backend)

#### App Information
- **App Name**: `double-v-strapi`
- **Production URL**: https://double-v-strapi-dd98523889e0.herokuapp.com
- **Admin Panel**: https://double-v-strapi-dd98523889e0.herokuapp.com/admin
- **API Base URL**: https://double-v-strapi-dd98523889e0.herokuapp.com/api

#### Git Remote
- **Remote Name**: `heroku-strapi`
- **Git URL**: https://git.heroku.com/double-v-strapi.git

#### Heroku Dashboard
- **Heroku Dashboard**: https://dashboard.heroku.com/apps/double-v-strapi
- **Logs**: `heroku logs --tail -a double-v-strapi`
- **Config**: `heroku config -a double-v-strapi`

#### Deployment
```bash
git subtree push --prefix project/strapi heroku-strapi main
```

---

### Predictive Service (FastAPI)

#### App Information
- **App Name**: `double-v-predictive`
- **Production URL**: https://double-v-predictive-10a3079347ff.herokuapp.com
- **API Base URL**: https://double-v-predictive-10a3079347ff.herokuapp.com/api/v1
- **API Documentation**: https://double-v-predictive-10a3079347ff.herokuapp.com/api/v1/docs
- **Health Check**: https://double-v-predictive-10a3079347ff.herokuapp.com/health

#### Git Remote
- **Remote Name**: `heroku-predictive`
- **Git URL**: https://git.heroku.com/double-v-predictive.git

#### Heroku Dashboard
- **Heroku Dashboard**: https://dashboard.heroku.com/apps/double-v-predictive
- **Logs**: `heroku logs --tail -a double-v-predictive`
- **Config**: `heroku config -a double-v-predictive`

#### Deployment
```bash
git subtree push --prefix project/predictive-service heroku-predictive main
```

---

## 🔗 Quick Reference

### All Production URLs
1. **Frontend**: https://frontend-ni46sn02m-charenas-projects.vercel.app
2. **Strapi Admin**: https://double-v-strapi-dd98523889e0.herokuapp.com/admin
3. **Strapi API**: https://double-v-strapi-dd98523889e0.herokuapp.com/api
4. **Predictive API**: https://double-v-predictive-10a3079347ff.herokuapp.com/api/v1
5. **API Docs**: https://double-v-predictive-10a3079347ff.herokuapp.com/api/v1/docs

### Dashboard Links
1. **GitHub**: https://github.com/charena-hengsathorn/double-v
2. **Vercel**: https://vercel.com/charenas-projects/frontend
3. **Heroku Strapi**: https://dashboard.heroku.com/apps/double-v-strapi
4. **Heroku Predictive**: https://dashboard.heroku.com/apps/double-v-predictive

---

## 📝 Deployment Commands

### Complete Deployment (All Services)
```bash
# 1. Commit and push to GitHub
git add -A
git commit -m "Your commit message"
git push origin main

# 2. Deploy to Vercel (auto-deploys, or manual)
cd project/frontend
vercel --prod

# 3. Deploy to Heroku (after heroku login)
cd /Users/charena/Projects/double-v
git subtree push --prefix project/strapi heroku-strapi main
git subtree push --prefix project/predictive-service heroku-predictive main
```

### Individual Deployments

#### Frontend (Vercel)
```bash
cd project/frontend
vercel --prod
```

#### Strapi (Heroku)
```bash
cd /Users/charena/Projects/double-v
git subtree push --prefix project/strapi heroku-strapi main
```

#### Predictive Service (Heroku)
```bash
cd /Users/charena/Projects/double-v
git subtree push --prefix project/predictive-service heroku-predictive main
```

---

## 🔧 Useful Commands

### Heroku
```bash
# View logs
heroku logs --tail -a double-v-strapi
heroku logs --tail -a double-v-predictive

# View config
heroku config -a double-v-strapi
heroku config -a double-v-predictive

# Open app in browser
heroku open -a double-v-strapi
heroku open -a double-v-predictive

# Check app status
heroku ps -a double-v-strapi
heroku ps -a double-v-predictive
```

### Git
```bash
# View remotes
git remote -v

# Push to specific remote
git push origin main
git subtree push --prefix project/strapi heroku-strapi main
git subtree push --prefix project/predictive-service heroku-predictive main
```

---

## 📅 Last Updated
Created: 2026-01-16

---

*This file contains all deployment links and commands for the Double V project.*

