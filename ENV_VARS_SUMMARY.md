# Environment Variables Summary

## ✅ Heroku - Strapi (`double-v-strapi`)

**Status:** Already configured

**Key Variables:**
- `STRAPI_URL`: https://double-v-strapi-dd98523889e0.herokuapp.com
- `FRONTEND_URL`: https://double-v-frontend.vercel.app
- `PREDICTIVE_SERVICE_URL`: https://double-v-predictive-10a3079347ff.herokuapp.com
- `DATABASE_URL`: (PostgreSQL - auto-configured by Heroku)
- `NODE_ENV`: production
- `APP_KEYS`, `JWT_SECRET`, `ADMIN_JWT_SECRET`, etc. (all set)

**View all:**
```bash
heroku config --app double-v-strapi
```

---

## ✅ Heroku - Predictive Service (`double-v-predictive`)

**Status:** Already configured

**Key Variables:**
- `STRAPI_URL`: https://double-v-strapi-dd98523889e0.herokuapp.com/api
- `CORS_ORIGINS`: https://double-v-frontend.vercel.app,http://localhost:3000
- `ENVIRONMENT`: production
- `LOG_LEVEL`: INFO
- `MODEL_VERSION`: 1.0.0
- `MONTE_CARLO_ITERATIONS`: 10000
- `FORECAST_HORIZON_MONTHS`: 12

**View all:**
```bash
heroku config --app double-v-predictive
```

---

## ✅ Vercel - Frontend (`double-v`)

**Status:** Just configured (Dec 18, 2025)

**Environment Variables Set:**
- `NEXT_PUBLIC_STRAPI_URL`: https://double-v-strapi-dd98523889e0.herokuapp.com/api
- `NEXT_PUBLIC_PREDICTIVE_SERVICE_URL`: https://double-v-predictive-10a3079347ff.herokuapp.com/api/v1
- `NEXT_PUBLIC_APP_URL`: https://double-v.vercel.app

**View all:**
```bash
vercel env ls
```

**Note:** All variables are set for `Production` environment only. If you need them for Preview/Development, add them separately:
```bash
vercel env add NEXT_PUBLIC_STRAPI_URL preview
vercel env add NEXT_PUBLIC_STRAPI_URL development
```

---

## 🔄 Updating Environment Variables

### Heroku

**Add/Update:**
```bash
heroku config:set KEY=value --app double-v-strapi
heroku config:set KEY=value --app double-v-predictive
```

**Remove:**
```bash
heroku config:unset KEY --app double-v-strapi
```

**View:**
```bash
heroku config --app double-v-strapi
heroku config --app double-v-predictive
```

### Vercel

**Add:**
```bash
vercel env add VARIABLE_NAME production
# Then paste the value when prompted
```

**Remove:**
```bash
vercel env rm VARIABLE_NAME production
```

**View:**
```bash
vercel env ls
```

---

## ⚠️ Important Notes

1. **Vercel requires redeployment** after adding env vars:
   ```bash
   vercel --prod
   ```

2. **Heroku restarts automatically** when config vars change

3. **NEXT_PUBLIC_*** prefix is required** for Vercel variables that need to be accessible in the browser

4. **Secrets should never be committed** to Git - always use environment variables

5. **Production URLs** should point to Heroku services, not localhost

---

## 🔍 Verification

**Check if services can communicate:**

1. **Frontend → Strapi:**
   - Frontend should use `NEXT_PUBLIC_STRAPI_URL`
   - Check browser console for API calls

2. **Frontend → Predictive Service:**
   - Frontend should use `NEXT_PUBLIC_PREDICTIVE_SERVICE_URL`
   - Check browser console for API calls

3. **Predictive Service → Strapi:**
   - Predictive service uses `STRAPI_URL`
   - Check Heroku logs: `heroku logs --tail --app double-v-predictive`

---

## 📝 Quick Reference

**Service URLs:**
- Strapi: https://double-v-strapi-dd98523889e0.herokuapp.com
- Predictive: https://double-v-predictive-10a3079347ff.herokuapp.com
- Frontend: https://double-v.vercel.app

**Last Updated:** December 18, 2025



