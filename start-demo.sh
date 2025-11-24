#!/bin/bash

# Double V Demo - Start All Services and Open Browser
# Run this from the project root: ./start-demo.sh

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Double V Demo - Starting All Services${NC}"
echo "=============================================="
echo ""

# Check if services are scaffolded
check_service() {
    local service=$1
    local check_file=$2
    
    if [ ! -f "$check_file" ]; then
        echo -e "${RED}❌ $service not scaffolded. Missing: $check_file${NC}"
        echo "   Please scaffold services first."
        exit 1
    fi
}

echo "📋 Checking services..."
check_service "Strapi" "project/strapi/package.json"
check_service "Predictive Service" "project/predictive-service/requirements.txt"
check_service "Frontend" "project/frontend/package.json"
echo -e "${GREEN}✅ All services ready${NC}"
echo ""

# Cleanup function
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Stopping services...${NC}"
    kill $STRAPI_PID $PREDICTIVE_PID $FRONTEND_PID 2>/dev/null || true
    echo -e "${GREEN}✅ Services stopped${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start Strapi
echo -e "${GREEN}📦 Starting Strapi CMS...${NC}"
cd project/strapi
npm run develop > /tmp/strapi.log 2>&1 &
STRAPI_PID=$!
echo "   PID: $STRAPI_PID | Log: /tmp/strapi.log"
cd ../..
sleep 3

# Start Predictive Service
echo -e "${GREEN}🐍 Starting Predictive Service...${NC}"
cd project/predictive-service
if [ ! -d "venv" ]; then
    echo "   Creating virtual environment..."
    python3 -m venv venv
fi
source venv/bin/activate
if [ ! -f "venv/bin/uvicorn" ]; then
    echo "   Installing dependencies..."
    pip install -q -r requirements.txt
fi
uvicorn app.main:app --reload --port 8000 > /tmp/predictive.log 2>&1 &
PREDICTIVE_PID=$!
echo "   PID: $PREDICTIVE_PID | Log: /tmp/predictive.log"
cd ../..
sleep 2

# Start Frontend
echo -e "${GREEN}⚛️  Starting Next.js Frontend...${NC}"
cd project/frontend
if [ ! -d "node_modules" ]; then
    echo "   Installing dependencies..."
    npm install --silent
fi
npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   PID: $FRONTEND_PID | Log: /tmp/frontend.log"
cd ../..

echo ""
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"

# Wait for services to be ready
wait_for_service() {
    local url=$1
    local name=$2
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            echo -e "${GREEN}   ✅ $name is ready${NC}"
            return 0
        fi
        attempt=$((attempt + 1))
        sleep 1
    done
    
    echo -e "${RED}   ❌ $name failed to start${NC}"
    return 1
}

wait_for_service "http://localhost:8000/api/v1/health" "Predictive Service"
wait_for_service "http://localhost:3000" "Frontend"
wait_for_service "http://localhost:1337/admin" "Strapi"

echo ""
echo "=============================================="
echo -e "${GREEN}✅ All services are running!${NC}"
echo ""
echo "Services:"
echo -e "  ${BLUE}•${NC} Frontend:        http://localhost:3000"
echo -e "  ${BLUE}•${NC} Strapi Admin:    http://localhost:1337/admin"
echo -e "  ${BLUE}•${NC} Predictive API:   http://localhost:8000/api/v1/health"
echo ""

# Open browser
echo -e "${GREEN}🌐 Opening browser...${NC}"
if command -v open > /dev/null; then
    # macOS
    open http://localhost:3000
elif command -v xdg-open > /dev/null; then
    # Linux
    xdg-open http://localhost:3000
elif command -v start > /dev/null; then
    # Windows
    start http://localhost:3000
else
    echo -e "${YELLOW}⚠️  Could not auto-open browser. Please open: http://localhost:3000${NC}"
fi

echo ""
echo "=============================================="
echo -e "${YELLOW}📊 View Logs:${NC}"
echo "  tail -f /tmp/strapi.log"
echo "  tail -f /tmp/predictive.log"
echo "  tail -f /tmp/frontend.log"
echo ""
echo -e "${YELLOW}🛑 To stop all services:${NC}"
echo "  Press Ctrl+C or run: kill $STRAPI_PID $PREDICTIVE_PID $FRONTEND_PID"
echo ""
echo -e "${GREEN}✨ Demo is ready! Enjoy!${NC}"
echo ""

# Keep script running
wait

