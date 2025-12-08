#!/bin/bash

# Start all services for demo
# Run this from the project root

set -e

echo "🚀 Starting Double V Demo Services"
echo "==================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if services are scaffolded
if [ ! -f "project/strapi/package.json" ]; then
    echo "❌ Strapi not scaffolded. Run setup first."
    exit 1
fi

if [ ! -f "project/predictive-service/requirements.txt" ]; then
    echo "❌ Predictive service not scaffolded. Run setup first."
    exit 1
fi

if [ ! -f "project/frontend/package.json" ]; then
    echo "❌ Frontend not scaffolded. Run setup first."
    exit 1
fi

echo "Starting services in separate terminals..."
echo ""

# Start Strapi
echo -e "${GREEN}📦 Starting Strapi...${NC}"
cd project/strapi
npm run develop > /tmp/strapi.log 2>&1 &
STRAPI_PID=$!
echo "Strapi starting on http://localhost:1337 (PID: $STRAPI_PID)"
cd ../..

sleep 5

# Start Predictive Service
echo -e "${GREEN}🐍 Starting Predictive Service...${NC}"
cd project/predictive-service
source venv/bin/activate
uvicorn app.main:app --reload --port 8000 > /tmp/predictive.log 2>&1 &
PREDICTIVE_PID=$!
echo "Predictive Service starting on http://localhost:8000 (PID: $PREDICTIVE_PID)"
cd ../..

sleep 3

# Start Frontend
echo -e "${GREEN}⚛️  Starting Next.js Frontend...${NC}"
cd project/frontend
npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend starting on http://localhost:3000 (PID: $FRONTEND_PID)"
cd ../..

echo ""
echo "==================================="
echo -e "${GREEN}✅ All services starting!${NC}"
echo ""
echo "Services:"
echo "  - Strapi: http://localhost:1337"
echo "  - Predictive Service: http://localhost:8000"
echo "  - Frontend: http://localhost:3000"
echo ""
echo "Logs:"
echo "  - Strapi: tail -f /tmp/strapi.log"
echo "  - Predictive: tail -f /tmp/predictive.log"
echo "  - Frontend: tail -f /tmp/frontend.log"
echo ""
echo "To stop all services:"
echo "  kill $STRAPI_PID $PREDICTIVE_PID $FRONTEND_PID"
echo ""



