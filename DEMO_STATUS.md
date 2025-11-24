# 🚀 Demo Services Status

## Services Running

### ✅ Predictive Service (Python FastAPI)
- **URL**: http://localhost:8000
- **Health Check**: http://localhost:8000/api/v1/health
- **Status**: Running
- **Logs**: `/tmp/predictive.log`

### 🔄 Strapi CMS
- **URL**: http://localhost:1337
- **Admin**: http://localhost:1337/admin
- **Status**: Starting (may need initial setup)
- **Logs**: `/tmp/strapi.log`

### 🔄 Next.js Frontend
- **URL**: http://localhost:3000
- **Status**: Starting
- **Logs**: `/tmp/frontend.log`

## Quick Access

Open in your browser:
- **Frontend Dashboard**: http://localhost:3000
- **Strapi Admin**: http://localhost:1337/admin (first time: create admin user)
- **API Health**: http://localhost:8000/api/v1/health

## Next Steps

1. **Strapi Setup** (first time only):
   - Go to http://localhost:1337/admin
   - Create admin user
   - Start configuring content types

2. **View Logs**:
   ```bash
   tail -f /tmp/strapi.log
   tail -f /tmp/predictive.log
   tail -f /tmp/frontend.log
   ```

3. **Stop Services**:
   ```bash
   pkill -f "strapi\|uvicorn\|next"
   ```

## Services are starting up! 🎉

Give them a few seconds to fully initialize, then open http://localhost:3000 in your browser.

