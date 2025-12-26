# Heroku CLI Configuration Complete

## ✅ What's Been Set Up

1. **Git Remotes Configured** (in project root):
   - `heroku-strapi` → `https://git.heroku.com/double-v-strapi.git`
   - `heroku-predictive` → `https://git.heroku.com/double-v-predictive.git`

2. **Deployment Scripts Created**:
   - `scripts/deploy-heroku.sh` - Uses Heroku CLI with git remotes
   - `scripts/deploy-heroku-builds.sh` - Uses `heroku builds:create`
   - `scripts/deploy-heroku-api.sh` - Uses Heroku API directly

3. **Credentials Found**:
   - Heroku API token is stored in `~/.netrc`

## 🚀 How to Deploy

### Option 1: Manual Deployment (Recommended for First Time)

Since Heroku CLI requires interactive authentication, you'll need to run these commands manually:

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

**Note:** The first time you run `heroku git:remote`, it will prompt you to authenticate. After that, subsequent deployments should work without prompts.

### Option 2: Using Deployment Scripts

Once authenticated, you can use:

```bash
# From project root
./scripts/deploy-heroku.sh
```

Or:

```bash
./scripts/deploy-heroku-builds.sh
```

### Option 3: Using Git Subtree (From Root)

If authentication is working:

```bash
# From project root
git subtree push --prefix project/strapi heroku-strapi main
git subtree push --prefix project/predictive-service heroku-predictive main
```

## 🔐 Authentication

If you get authentication errors:

1. **Refresh Heroku login:**
   ```bash
   heroku login
   ```

2. **Verify authentication:**
   ```bash
   heroku auth:whoami
   ```

3. **Check your apps:**
   ```bash
   heroku apps
   ```

## 📝 Current Status

- ✅ Git remotes configured
- ✅ Deployment scripts created
- ✅ Credentials found in .netrc
- ⚠️  Interactive authentication required for first deployment

## 🎯 Next Steps

1. **Authenticate with Heroku CLI:**
   ```bash
   heroku login
   ```

2. **Deploy Strapi:**
   ```bash
   cd project/strapi
   heroku git:remote -a double-v-strapi
   git push heroku main
   ```

3. **Deploy Predictive Service:**
   ```bash
   cd project/predictive-service
   heroku git:remote -a double-v-predictive
   git push heroku main
   ```

4. **Verify deployments:**
   ```bash
   heroku ps -a double-v-strapi
   heroku ps -a double-v-predictive
   ```

## 🔄 Future Deployments

Once the initial setup is complete, you can deploy by simply running:

```bash
cd project/strapi && git push heroku main
cd ../predictive-service && git push heroku main
```

Or use the deployment scripts from the project root.

## 📚 Additional Resources

- [Heroku Git Deployment](https://devcenter.heroku.com/articles/git)
- [Heroku CLI Reference](https://devcenter.heroku.com/articles/heroku-cli-commands)



