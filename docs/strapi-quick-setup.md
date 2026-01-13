# Strapi Quick Setup Guide

## Why You're Getting 404 Errors

Strapi content types are created, but **permissions need to be configured** before the API endpoints are accessible.

## Quick Fix (2 minutes)

### Step 1: Access Strapi Admin
1. Open: http://localhost:1337/admin
2. If first time, create an admin account

### Step 2: Configure Public Permissions
1. Go to: **Settings** → **Users & Permissions Plugin** → **Roles** → **Public**
2. Scroll down to **Permissions**
3. For each content type, check ALL boxes:
   - ✅ `find`
   - ✅ `findOne`
   - ✅ `create`
   - ✅ `update`
   - ✅ `delete`

**Content Types to Configure:**
- `client`
- `project`
- `pipeline-deal`
- `deal-milestone`
- `forecast-snapshot`
- `billing`
- `risk-flag`

4. Click **Save** at the top

### Step 3: Verify
```bash
curl http://localhost:1337/api/pipeline-deals
```

Should return: `{"data":[]}` (empty array is fine - means API works!)

## Alternative: Automatic Setup

The bootstrap script in `src/index.ts` will attempt to set permissions automatically on Strapi restart, but manual setup is more reliable for first-time setup.

## After Setup

Once permissions are configured:
- ✅ Predictive service will be able to fetch data from Strapi
- ✅ Frontend will be able to fetch data from Strapi
- ✅ 500 errors will be resolved (they were caused by 404s from Strapi)

## Troubleshooting

**Still getting 404?**
- Make sure Strapi is running: `curl http://localhost:1337/admin`
- Check Strapi logs: `tail -f /tmp/strapi.log`
- Verify content types are registered (should see them in admin panel under Content Manager)

**Getting 403 Forbidden?**
- Permissions not set correctly - repeat Step 2 above
- Make sure you clicked "Save" after checking boxes





