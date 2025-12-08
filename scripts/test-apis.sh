#!/bin/bash

# Test API endpoints to verify everything is working

echo "🧪 Testing API Endpoints"
echo "========================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

test_endpoint() {
    local url=$1
    local name=$2
    
    echo -n "Testing $name... "
    response=$(curl -s -w "\n%{http_code}" "$url")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed (HTTP $http_code)${NC}"
        echo "  Response: $body" | head -3
        return 1
    fi
}

# Test Strapi
echo "📦 Strapi API Tests"
echo "-------------------"
test_endpoint "http://localhost:1337/api/clients" "Clients"
test_endpoint "http://localhost:1337/api/projects" "Projects"
test_endpoint "http://localhost:1337/api/pipeline-deals" "Pipeline Deals"
test_endpoint "http://localhost:1337/api/forecast-snapshots" "Forecast Snapshots"
test_endpoint "http://localhost:1337/api/billings" "Billings"
test_endpoint "http://localhost:1337/api/risk-flags" "Risk Flags"
echo ""

# Test Predictive Service
echo "🐍 Predictive Service API Tests"
echo "-------------------------------"
test_endpoint "http://localhost:8000/api/v1/health" "Health Check"
test_endpoint "http://localhost:8000/api/v1/models/forecast/base" "Base Forecast"
test_endpoint "http://localhost:8000/api/v1/models/risk/heatmap" "Risk Heatmap"
test_endpoint "http://localhost:8000/api/v1/models/variance/waterfall" "Waterfall"
echo ""

# Test Frontend
echo "⚛️  Frontend Tests"
echo "------------------"
test_endpoint "http://localhost:3000" "Homepage"
test_endpoint "http://localhost:3000/pipeline-integrity" "Pipeline Integrity"
test_endpoint "http://localhost:3000/financials" "Financials"
test_endpoint "http://localhost:3000/executive-summary" "Executive Summary"
echo ""

echo "========================"
echo -e "${GREEN}✅ API Testing Complete${NC}"
echo ""
echo "If any tests failed:"
echo "  1. Check if services are running: ./start-demo.sh"
echo "  2. Check Strapi permissions: http://localhost:1337/admin"
echo "  3. Check logs: tail -f /tmp/*.log"



