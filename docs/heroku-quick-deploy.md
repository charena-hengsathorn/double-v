# Quick Heroku Deployment Guide

## ⚠️ Important: Always Deploy from Project Root

**Never** `cd` into subdirectories before deploying. Always run these commands from:
```
/Users/charena/Projects/double-v
```

## ✅ Correct Deployment Commands

### Option 1: Use the Script (Easiest)
```bash
cd /Users/charena/Projects/double-v
./scripts/deploy-heroku-correct.sh
```

### Option 2: Manual Commands
```bash
# Make sure you're in the project root
cd /Users/charena/Projects/double-v

# Deploy Strapi
git subtree push --prefix project/strapi heroku-strapi main

# Deploy Predictive Service
git subtree push --prefix project/predictive-service heroku-predictive main
```

## ❌ What NOT to Do

**Don't do this:**
```bash
cd project/strapi          # ❌ Wrong!
git push heroku main       # ❌ This pushes entire repo, not just strapi
```

**Why it fails:**
- Pushes entire monorepo to Heroku
- Heroku can't detect buildpack
- Creates git history conflicts
- Wrong app gets deployed

## 🔍 Verify You're in the Right Place

Before deploying, check:
```bash
pwd
# Should show: /Users/charena/Projects/double-v

ls project/strapi project/predictive-service
# Should show both directories exist
```

## 🚀 One-Liner for Both Apps

```bash
cd /Users/charena/Projects/double-v && \
git subtree push --prefix project/strapi heroku-strapi main && \
git subtree push --prefix project/predictive-service heroku-predictive main
```

## 📝 Check Deployment Status

```bash
heroku ps -a double-v-strapi
heroku ps -a double-v-predictive
```

## 🔧 If You Get Errors

**"non-fast-forward" error:**
- You're probably in a subdirectory
- Go back to root: `cd /Users/charena/Projects/double-v`
- Use `git subtree push` method

**"No default language detected":**
- You're pushing from a subdirectory
- Use `git subtree push` from root instead

**Wrong app being deployed:**
- Check your current directory: `pwd`
- Make sure you're in the project root
- Remove any heroku remotes from subdirectories

