# 🚀 How to Start the Demo

## Quick Start

From the project root directory, simply run:

```bash
./start-demo.sh
```

That's it! The script will:
1. ✅ Check all services are ready
2. ✅ Start Strapi (port 1337)
3. ✅ Start Python service (port 8000)
4. ✅ Start Next.js frontend (port 3000)
5. ✅ Wait for all services to be ready
6. ✅ Open your browser automatically to http://localhost:3000

## What You'll See

- **Frontend Dashboard**: http://localhost:3000
- **Strapi Admin**: http://localhost:1337/admin
- **API Health Check**: http://localhost:8000/api/v1/health

## To Stop

Press `Ctrl+C` in the terminal where the script is running.

The script will automatically stop all services.

## Alternative: Manual Start

If you prefer to start services manually:

### Terminal 1 - Strapi
```bash
cd project/strapi
npm run develop
```

### Terminal 2 - Python Service
```bash
cd project/predictive-service
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

### Terminal 3 - Frontend
```bash
cd project/frontend
npm run dev
```

Then open http://localhost:3000 in your browser.

---

**That's it! Just run `./start-demo.sh` and you're good to go!** 🎉

