# CLI Tokens & Credentials

## 🔐 Important: Keep These Secure

**⚠️ DO NOT commit these tokens to git!**

## Heroku API Token

### Long-term Token Created
✅ **Token created**: Double V CI/CD - Long-term token  
✅ **Expires**: Nov 24, 2026 (12 months)  
✅ **Scope**: global  
✅ **Status**: Configured in GitHub Secrets

**Note**: Token is stored securely in GitHub Secrets, not in this repository.

### How to Get Current Token
```bash
# Get current session token (expires in 7 days)
heroku auth:token

# Create new long-term token
heroku authorizations:create --description "Double V CI/CD" --expires-in 31536000
```

### View All Authorizations
```bash
heroku authorizations
```

## Vercel API Token

### How to Get Vercel Token
1. Go to: https://vercel.com/account/tokens
2. Click "Create Token"
3. Name it: "Double V CI/CD"
4. Copy the token

### Current Vercel Project Info
- **Project ID**: `prj_fbDwMFTU4TY3kR1F4uJxFvDgmePF`
- **Org ID**: `team_znfWLFKFRbVqjbqoZ1C1qI40`
- **Project Name**: `frontend`

## GitHub Secrets Status

✅ **Configured Secrets:**
- `HEROKU_API_KEY` - Long-term token (expires Nov 2026)
- `HEROKU_EMAIL` - charenah@gmail.com
- `HEROKU_STRAPI_APP_NAME` - double-v-strapi
- `HEROKU_PREDICTIVE_APP_NAME` - double-v-predictive

🔲 **Still Need:**
- `VERCEL_TOKEN` - Get from https://vercel.com/account/tokens
- `VERCEL_ORG_ID` - Already have: team_znfWLFKFRbVqjbqoZ1C1qI40
- `VERCEL_PROJECT_ID` - Already have: prj_fbDwMFTU4TY3kR1F4uJxFvDgmePF

## Quick Setup Commands

### Update Heroku Token in GitHub
```bash
# Get current token
heroku auth:token

# Or create new long-term token
heroku authorizations:create --description "Double V CI/CD" --expires-in 31536000

# Update GitHub secret
gh secret set HEROKU_API_KEY --body "<your-token>"
```

### Add Vercel Token to GitHub (after getting it)
```bash
gh secret set VERCEL_TOKEN --body "<your-vercel-token>"
gh secret set VERCEL_ORG_ID --body "team_znfWLFKFRbVqjbqoZ1C1qI40"
gh secret set VERCEL_PROJECT_ID --body "prj_fbDwMFTU4TY3kR1F4uJxFvDgmePF"
```

## Security Notes

1. **Never commit tokens to git** - They're in `.gitignore`
2. **Rotate tokens regularly** - Especially if exposed
3. **Use long-term tokens for CI/CD** - Avoid frequent updates
4. **Store tokens securely** - Use password manager or secure vault
5. **Monitor token usage** - Check for unauthorized access

## Token Rotation

### Heroku Token Expired?
```bash
# Create new token
heroku authorizations:create --description "Double V CI/CD" --expires-in 31536000

# Update GitHub secret
gh secret set HEROKU_API_KEY --body "<new-token>"

# Revoke old token (optional)
heroku authorizations:revoke <old-token-id>
```

### Vercel Token Expired?
1. Go to https://vercel.com/account/tokens
2. Revoke old token
3. Create new token
4. Update GitHub secret: `gh secret set VERCEL_TOKEN --body "<new-token>"`

---

**Last Updated**: November 24, 2025

