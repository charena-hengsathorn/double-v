# CLI Setup Guide

## ✅ Current Status

### Heroku CLI
- ✅ **Authenticated as**: `charenah@gmail.com`
- ✅ **Apps visible**: `double-v-strapi`, `double-v-predictive`
- ✅ **CLI Version**: Installed and working

### Vercel CLI
- ✅ **Authenticated as**: `charena-hengsathorn`
- ✅ **Projects visible**: `frontend`, `double-v-frontend`
- ✅ **CLI Version**: 46.0.4

## 🔧 Setup Instructions

### Heroku CLI Setup

#### 1. Install Heroku CLI (if not installed)
```bash
# macOS
brew tap heroku/brew && brew install heroku

# Or download from: https://devcenter.heroku.com/articles/heroku-cli
```

#### 2. Login to Heroku
```bash
heroku login
# This will open a browser for authentication
```

#### 3. Verify Authentication
```bash
heroku auth:whoami
# Should show: charenah@gmail.com
```

#### 4. Create Long-term API Token (for CI/CD)
```bash
# Create token that expires in 1 year
heroku authorizations:create --description "Double V CI/CD" --expires-in 31536000

# Or create permanent token (not recommended for security)
heroku authorizations:create --description "Double V CI/CD - Permanent"
```

#### 5. View Your Apps
```bash
heroku apps
# Should show: double-v-strapi, double-v-predictive
```

#### 6. Useful Heroku Commands
```bash
# View app info
heroku info -a double-v-strapi
heroku info -a double-v-predictive

# View logs
heroku logs --tail -a double-v-strapi
heroku logs --tail -a double-v-predictive

# View config vars
heroku config -a double-v-strapi
heroku config -a double-v-predictive

# Open app in browser
heroku open -a double-v-strapi
heroku open -a double-v-predictive

# Get API token (current session)
heroku auth:token
```

### Vercel CLI Setup

#### 1. Install Vercel CLI (if not installed)
```bash
# Using npm
npm i -g vercel

# Or using Homebrew (macOS)
brew install vercel-cli
```

#### 2. Login to Vercel
```bash
vercel login
# This will open a browser for authentication
```

#### 3. Verify Authentication
```bash
vercel whoami
# Should show: charena-hengsathorn
```

#### 4. Link Project
```bash
cd project/frontend
vercel link
# Select existing project or create new one
```

#### 5. View Projects
```bash
vercel projects ls
# Should show: frontend, double-v-frontend
```

#### 6. Create API Token (for CI/CD)
1. Go to: https://vercel.com/account/tokens
2. Click "Create Token"
3. Name it: "Double V CI/CD"
4. Copy the token (you'll need it for GitHub Secrets)

#### 7. Useful Vercel Commands
```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel

# View deployments
vercel ls

# View logs
vercel logs

# View project info
vercel inspect

# Add environment variable
vercel env add NEXT_PUBLIC_STRAPI_URL production

# List environment variables
vercel env ls
```

## 🔐 GitHub Secrets Configuration

### Required Secrets for CI/CD

#### Heroku Secrets
```bash
# Get Heroku API token
heroku auth:token
# Or use the long-term token created above

# Add to GitHub Secrets
gh secret set HEROKU_API_KEY --body "<token>"
gh secret set HEROKU_EMAIL --body "charenah@gmail.com"
gh secret set HEROKU_STRAPI_APP_NAME --body "double-v-strapi"
gh secret set HEROKU_PREDICTIVE_APP_NAME --body "double-v-predictive"
```

#### Vercel Secrets
```bash
# Get Vercel token from: https://vercel.com/account/tokens
# Get Project ID and Org ID from project settings

gh secret set VERCEL_TOKEN --body "<token>"
gh secret set VERCEL_ORG_ID --body "team_znfWLFKFRbVqjbqoZ1C1qI40"
gh secret set VERCEL_PROJECT_ID --body "prj_fbDwMFTU4TY3kR1F4uJxFvDgmePF"
```

## ✅ Verification Checklist

Run this to verify everything is set up:

```bash
# Heroku
heroku auth:whoami
heroku apps | grep double-v

# Vercel
vercel whoami
vercel projects ls | grep -E "frontend|double-v"

# GitHub
gh auth status
gh secret list
```

## 🚨 Troubleshooting

### Heroku CLI Issues

**Problem**: `heroku: command not found`
```bash
# Install Heroku CLI
brew tap heroku/brew && brew install heroku
```

**Problem**: Not authenticated
```bash
heroku login
```

**Problem**: Token expired
```bash
# Generate new token
heroku authorizations:create --description "Double V CI/CD" --expires-in 31536000
```

### Vercel CLI Issues

**Problem**: `vercel: command not found`
```bash
# Install Vercel CLI
npm i -g vercel
```

**Problem**: Not authenticated
```bash
vercel login
```

**Problem**: Project not linked
```bash
cd project/frontend
vercel link
```

## 📚 Additional Resources

- [Heroku CLI Documentation](https://devcenter.heroku.com/articles/heroku-cli)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [GitHub CLI Documentation](https://cli.github.com/manual/)

## 🎯 Quick Reference

### Heroku
- **Email**: charenah@gmail.com
- **Apps**: double-v-strapi, double-v-predictive
- **API Token**: Get with `heroku auth:token` or create long-term with `heroku authorizations:create`

### Vercel
- **Username**: charena-hengsathorn
- **Projects**: frontend, double-v-frontend
- **API Token**: Get from https://vercel.com/account/tokens
- **Project ID**: prj_fbDwMFTU4TY3kR1F4uJxFvDgmePF
- **Org ID**: team_znfWLFKFRbVqjbqoZ1C1qI40

---

**All CLIs are configured and ready to use!** ✅

