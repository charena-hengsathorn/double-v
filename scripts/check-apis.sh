#!/bin/bash

# Check all API endpoints

echo "🔍 Checking All APIs"
echo "==================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check Predictive Service
echo "📡 Predictive Service (http://localhost:8000)"
echo "--------------------------------------------"
if curl -s http://localhost:8000/api/v1/health > /dev/null; then
    echo -e "${GREEN}✅ Health: OK${NC}"
    curl -s http://localhost:8000/api/v1/health | jq . 2>/dev/null || curl -s http://localhost:8000/api/v1/health
else
    echo -e "${RED}❌ Health: Not responding${NC}"
fi

if curl -s http://localhost:8000/api/v1/models/forecast/base > /dev/null; then
    echo -e "${GREEN}✅ Forecast Base: OK${NC}"
else
    echo -e "${RED}❌ Forecast Base: Not responding${NC}"
fi

if curl -s http://localhost:8000/api/v1/models/risk/heatmap > /dev/null; then
    echo -e "${GREEN}✅ Risk Heatmap: OK${NC}"
else
    echo -e "${RED}❌ Risk Heatmap: Not responding${NC}"
fi

echo ""

# Check Strapi
echo "📡 Strapi CMS (http://localhost:1337)"
echo "-------------------------------------"
if curl -s http://localhost:1337/admin > /dev/null; then
    echo -e "${GREEN}✅ Admin Panel: OK${NC}"
else
    echo -e "${RED}❌ Admin Panel: Not responding${NC}"
fi

if curl -s http://localhost:1337/api > /dev/null; then
    echo -e "${GREEN}✅ API: OK${NC}"
else
    echo -e "${YELLOW}⚠️  API: May need setup${NC}"
fi

echo ""

# Check Frontend
echo "📡 Frontend (http://localhost:3000)"
echo "----------------------------------"
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✅ Frontend: OK${NC}"
    if curl -s http://localhost:3000 | grep -q "Double V"; then
        echo -e "${GREEN}✅ Content: Loading correctly${NC}"
    else
        echo -e "${YELLOW}⚠️  Content: May have issues${NC}"
    fi
else
    echo -e "${RED}❌ Frontend: Not responding${NC}"
fi

echo ""
echo "==================="
echo "✅ API Check Complete"


