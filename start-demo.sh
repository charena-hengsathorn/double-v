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

# Kill any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "strapi develop" 2>/dev/null || true
pkill -f "uvicorn app.main:app" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
sleep 2

# Cleanup function
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Stopping services...${NC}"
    kill $STRAPI_PID $PREDICTIVE_PID $FRONTEND_PID 2>/dev/null || true
    wait $STRAPI_PID $PREDICTIVE_PID $FRONTEND_PID 2>/dev/null || true
    echo -e "${GREEN}✅ Services stopped${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start Strapi
echo -e "${BLUE}📦 Starting Strapi CMS...${NC}"
cd project/strapi

# Clear Strapi cache if needed
if [ -d ".next" ] || [ -d "dist" ]; then
    echo "   Clearing Strapi cache..."
    rm -rf .next dist 2>/dev/null || true
fi

# Check for .env file
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    echo -e "${YELLOW}   ⚠️  No .env file found, copying from .env.example${NC}"
    cp .env.example .env
fi

npm run develop > /tmp/strapi.log 2>&1 &
STRAPI_PID=$!
echo "   PID: $STRAPI_PID | Log: /tmp/strapi.log"
cd ../..
sleep 5

# Start Predictive Service
echo -e "${BLUE}🐍 Starting Predictive Service...${NC}"
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

# Check for .env.local file
if [ ! -f ".env.local" ] && [ -f "env.example" ]; then
    echo -e "${YELLOW}   ⚠️  No .env.local file found, copying from env.example${NC}"
    cp env.example .env.local
fi

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 > /tmp/predictive.log 2>&1 &
PREDICTIVE_PID=$!
echo "   PID: $PREDICTIVE_PID | Log: /tmp/predictive.log"
cd ../..
sleep 3

# Start Frontend
echo -e "${BLUE}⚛️  Starting Next.js Frontend...${NC}"
cd project/frontend

# Clear Next.js cache
if [ -d ".next" ]; then
    echo "   Clearing Next.js cache..."
    rm -rf .next
fi

if [ ! -d "node_modules" ]; then
    echo "   Installing dependencies..."
    npm install --silent
fi

# Check for .env.local file
if [ ! -f ".env.local" ] && [ -f "env.example" ]; then
    echo -e "${YELLOW}   ⚠️  No .env.local file found, copying from env.example${NC}"
    cp env.example .env.local
fi

npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   PID: $FRONTEND_PID | Log: /tmp/frontend.log"
cd ../..

echo ""
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"

# Wait for services to be ready with better error handling
wait_for_service() {
    local url=$1
    local name=$2
    local max_attempts=60
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s -f "$url" > /dev/null 2>&1; then
            echo -e "${GREEN}   ✅ $name is ready${NC}"
            return 0
        fi
        
        # Check if process is still running
        if [ "$name" = "Strapi" ] && ! kill -0 $STRAPI_PID 2>/dev/null; then
            echo -e "${RED}   ❌ $name process died${NC}"
            echo -e "${YELLOW}   Check logs: tail -50 /tmp/strapi.log${NC}"
            return 1
        fi
        
        if [ "$name" = "Predictive Service" ] && ! kill -0 $PREDICTIVE_PID 2>/dev/null; then
            echo -e "${RED}   ❌ $name process died${NC}"
            echo -e "${YELLOW}   Check logs: tail -50 /tmp/predictive.log${NC}"
            return 1
        fi
        
        if [ "$name" = "Frontend" ] && ! kill -0 $FRONTEND_PID 2>/dev/null; then
            echo -e "${RED}   ❌ $name process died${NC}"
            echo -e "${YELLOW}   Check logs: tail -50 /tmp/frontend.log${NC}"
            return 1
        fi
        
        attempt=$((attempt + 1))
        if [ $((attempt % 5)) -eq 0 ]; then
            echo -e "${YELLOW}   ⏳ Still waiting for $name... (${attempt}/${max_attempts})${NC}"
        fi
        sleep 1
    done
    
    echo -e "${RED}   ❌ $name failed to start after ${max_attempts} seconds${NC}"
    echo -e "${YELLOW}   Check logs: tail -50 /tmp/${name,,}.log | tr ' ' '_'${NC}"
    return 1
}

# Wait for services
STRAPI_READY=0
PREDICTIVE_READY=0
FRONTEND_READY=0

wait_for_service "http://localhost:8000/api/v1/health" "Predictive Service" && PREDICTIVE_READY=1 || true
wait_for_service "http://localhost:3000" "Frontend" && FRONTEND_READY=1 || true
wait_for_service "http://localhost:1337/admin" "Strapi" && STRAPI_READY=1 || true

echo ""
echo "=============================================="

# Check if all services are ready
if [ $STRAPI_READY -eq 1 ] && [ $PREDICTIVE_READY -eq 1 ] && [ $FRONTEND_READY -eq 1 ]; then
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
else
    echo -e "${RED}❌ Some services failed to start${NC}"
    echo ""
    [ $STRAPI_READY -eq 0 ] && echo -e "${RED}  • Strapi failed${NC}" || echo -e "${GREEN}  • Strapi running${NC}"
    [ $PREDICTIVE_READY -eq 0 ] && echo -e "${RED}  • Predictive Service failed${NC}" || echo -e "${GREEN}  • Predictive Service running${NC}"
    [ $FRONTEND_READY -eq 0 ] && echo -e "${RED}  • Frontend failed${NC}" || echo -e "${GREEN}  • Frontend running${NC}"
    echo ""
    echo -e "${YELLOW}📊 Check logs for details:${NC}"
    echo "  tail -50 /tmp/strapi.log"
    echo "  tail -50 /tmp/predictive.log"
    echo "  tail -50 /tmp/frontend.log"
    echo ""
    echo -e "${YELLOW}⚠️  Services may still be starting. Check logs above.${NC}"
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

# Keep script running
wait
