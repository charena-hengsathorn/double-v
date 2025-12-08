# Quick Start Guide - Node.js API Server

Get the API server up and running in 5 minutes!

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
cd project/api-server
npm install
```

### 2. Configure Environment

```bash
cp env.example .env
```

Edit `.env`:
```env
PORT=4000
STRAPI_URL=http://localhost:1337
PREDICTIVE_SERVICE_URL=http://localhost:8000
CORS_ORIGINS=http://localhost:3000
```

### 3. Start the Server

```bash
npm run dev
```

✅ Server running on http://localhost:4000

## 📝 Test It

### Health Check
```bash
curl http://localhost:4000/health
```

### Detailed Health
```bash
curl http://localhost:4000/health/detailed
```

### Test Strapi Proxy
```bash
curl http://localhost:4000/api/v1/strapi/clients \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test Predictive Service Proxy
```bash
curl http://localhost:4000/api/v1/predictive/models/forecast/base
```

## 🔗 API Endpoints

All endpoints are prefixed:

- **Strapi**: `/api/v1/strapi/*` → Proxies to Strapi `/api/*`
- **Predictive**: `/api/v1/predictive/*` → Proxies to Predictive Service `/api/v1/*`
- **Health**: `/health` and `/health/detailed`

## 📚 Next Steps

1. See [README.md](./README.md) for full documentation
2. See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) to migrate your frontend
3. Update frontend to use the new API server

## 🐛 Troubleshooting

**Port already in use?**
- Change `PORT` in `.env`

**502 Bad Gateway?**
- Make sure Strapi and Predictive Service are running
- Check URLs in `.env` are correct

**CORS errors?**
- Add your frontend URL to `CORS_ORIGINS` in `.env`

That's it! 🎉

