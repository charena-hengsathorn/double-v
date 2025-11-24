# Environment Variables Summary

## ✅ All Production Environment Variables Configured

### Heroku - Strapi (`double-v-strapi`)

**Application:**
- `NODE_ENV=production`
- `HOST=0.0.0.0` (default)
- `PORT=1337` (default)

**Secrets (Generated):**
- `JWT_SECRET` ✅
- `ADMIN_JWT_SECRET` ✅
- `APP_KEYS` (4 keys) ✅
- `API_TOKEN_SALT` ✅
- `TRANSFER_TOKEN_SALT` ✅
- `STRAPI_WEBHOOK_SECRET` ✅

**Database:**
- `DATABASE_URL` ✅ (auto-set by Heroku Postgres)

**URLs:**
- `STRAPI_URL=https://double-v-strapi-dd98523889e0.herokuapp.com` ✅
- `FRONTEND_URL=https://double-v-frontend.vercel.app` ✅
- `PREDICTIVE_SERVICE_URL=https://double-v-predictive-10a3079347ff.herokuapp.com` ✅

---

### Heroku - Predictive Service (`double-v-predictive`)

**Application:**
- `ENVIRONMENT=production` ✅
- `LOG_LEVEL=INFO` ✅
- `PORT=8000` (default)

**Strapi Integration:**
- `STRAPI_URL=https://double-v-strapi-dd98523889e0.herokuapp.com/api` ✅
- `STRAPI_WEBHOOK_SECRET` ✅
- `STRAPI_API_TOKEN` ⚠️ (needs to be set after Strapi is deployed and API token is created)

**CORS:**
- `CORS_ORIGINS=https://double-v-frontend.vercel.app,http://localhost:3000` ✅

**Model Configuration:**
- `MODEL_VERSION=1.0.0` ✅
- `MONTE_CARLO_ITERATIONS=10000` ✅
- `FORECAST_HORIZON_MONTHS=12` ✅

**Optional (Not Set):**
- `DATABASE_URL` (not needed, using Strapi API)
- `REDIS_URL` (optional, for caching)
- `EXCHANGE_RATE_API_KEY` (optional, for currency conversion)

---

### Vercel - Frontend (`frontend`)

**Public Environment Variables (Production):**
- `NEXT_PUBLIC_STRAPI_URL=https://double-v-strapi-dd98523889e0.herokuapp.com/api` ✅
- `NEXT_PUBLIC_PREDICTIVE_SERVICE_URL=https://double-v-predictive-10a3079347ff.herokuapp.com/api/v1` ✅
- `NEXT_PUBLIC_APP_URL=https://double-v-frontend.vercel.app` ✅

**Optional (Not Set):**
- `NEXT_PUBLIC_ANALYTICS_ID` (optional)
- `NEXT_PUBLIC_SENTRY_DSN` (optional)

---

## 📋 Quick Reference

### View Current Variables

**Heroku:**
```bash
heroku config -a double-v-strapi
heroku config -a double-v-predictive
```

**Vercel:**
```bash
cd project/frontend
vercel env ls
```

### Update Variables

**Heroku:**
```bash
heroku config:set KEY=value -a double-v-strapi
heroku config:set KEY=value -a double-v-predictive
```

**Vercel:**
```bash
cd project/frontend
echo "value" | vercel env add KEY production
```

### Remove Variables

**Heroku:**
```bash
heroku config:unset KEY -a double-v-strapi
```

**Vercel:**
```bash
cd project/frontend
vercel env rm KEY production
```

---

## ⚠️ Remaining Steps

1. **Set `STRAPI_API_TOKEN`** in `double-v-predictive` after:
   - Strapi is deployed
   - Admin user is created
   - API token is generated in Strapi admin panel

2. **Optional Variables** (if needed):
   - `REDIS_URL` for caching
   - `EXCHANGE_RATE_API_KEY` for currency conversion
   - Analytics and error tracking IDs

---

## 🔐 Security Notes

- All secrets are encrypted in Heroku and Vercel
- Never commit `.env.local` files to git (they're in `.gitignore`)
- Rotate secrets periodically
- Use different secrets for development and production

---

**Last Updated**: November 24, 2025  
**Status**: ✅ All required production variables configured

