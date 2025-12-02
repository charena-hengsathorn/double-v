# Correct Heroku Deployment Method

## ❌ Why Pushing from Subdirectories Doesn't Work

When you do this:
```bash
cd project/strapi
git push heroku main
```

Git pushes the **entire repository** to Heroku, not just the `project/strapi` folder. This causes:
1. **Buildpack detection failure** - Heroku sees the whole monorepo and can't determine the language
2. **Non-fast-forward errors** - The Heroku remote has a different history than your local repo

## ✅ Correct Method: Use Git Subtree from Root

Always deploy from the **project root** using `git subtree push`:

```bash
# From project root (/Users/charena/Projects/double-v)
cd /Users/charena/Projects/double-v

# Deploy Strapi
git subtree push --prefix project/strapi heroku-strapi main

# Deploy Predictive Service
git subtree push --prefix project/predictive-service heroku-predictive main
```

## How Git Subtree Works

`git subtree push`:
- Takes only the specified subdirectory (`--prefix project/strapi`)
- Creates a new commit with just that subdirectory's files
- Pushes that commit to Heroku
- Heroku receives only the subdirectory, can detect buildpack correctly

## Quick Reference

### Deploy Both Apps:
```bash
cd /Users/charena/Projects/double-v

# Strapi
git subtree push --prefix project/strapi heroku-strapi main

# Predictive Service  
git subtree push --prefix project/predictive-service heroku-predictive main
```

### Check Deployment Status:
```bash
heroku ps -a double-v-strapi
heroku ps -a double-v-predictive
```

### View Logs:
```bash
heroku logs --tail -a double-v-strapi
heroku logs --tail -a double-v-predictive
```

## Current Status

✅ **Both apps are already deployed and running:**
- Strapi: https://double-v-strapi-dd98523889e0.herokuapp.com/
- Predictive Service: https://double-v-predictive-10a3079347ff.herokuapp.com/

## Common Mistakes to Avoid

1. ❌ Don't `cd` into subdirectories before pushing
2. ❌ Don't use `git push heroku main` from subdirectories
3. ✅ Always use `git subtree push` from the root directory
4. ✅ Always specify the `--prefix` flag with the subdirectory path

## Troubleshooting

If you get "non-fast-forward" errors:
- This means Heroku has commits that your local repo doesn't have
- This happens when you've pushed from subdirectories before
- Solution: Use `git subtree push` which creates fresh commits

If buildpack detection fails:
- Make sure you're using `git subtree push` from root
- Verify buildpacks are set: `heroku buildpacks -a double-v-strapi`
- If needed, set explicitly: `heroku buildpacks:set heroku/nodejs -a double-v-strapi`

