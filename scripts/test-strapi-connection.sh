#!/bin/bash

# Script to test Strapi connection and content type registration

set -e

echo "🔍 Testing Strapi Connection to Frontend"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

STRAPI_URL="${STRAPI_URL:-http://localhost:1337}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:3000}"

# Test 1: Is Strapi running?
echo -e "${BLUE}Test 1: Checking if Strapi is running...${NC}"
if curl -s -o /dev/null -w "%{http_code}" "${STRAPI_URL}/api" | grep -q "200\|404"; then
    echo -e "${GREEN}✅ Strapi is accessible at ${STRAPI_URL}${NC}"
else
    echo -e "${RED}❌ Strapi is not accessible at ${STRAPI_URL}${NC}"
    echo "   Start Strapi: cd project/strapi && npm run develop"
    exit 1
fi
echo ""

# Test 2: Is Frontend running?
echo -e "${BLUE}Test 2: Checking if Frontend is running...${NC}"
if curl -s -o /dev/null -w "%{http_code}" "${FRONTEND_URL}" | grep -q "200"; then
    echo -e "${GREEN}✅ Frontend is accessible at ${FRONTEND_URL}${NC}"
else
    echo -e "${RED}❌ Frontend is not accessible at ${FRONTEND_URL}${NC}"
    echo "   Start Frontend: cd project/frontend && npm run dev"
    exit 1
fi
echo ""

# Test 3: Check Strapi API base
echo -e "${BLUE}Test 3: Checking Strapi API base endpoint...${NC}"
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${STRAPI_URL}/api")
if [ "$API_STATUS" = "200" ] || [ "$API_STATUS" = "404" ]; then
    echo -e "${GREEN}✅ Strapi API endpoint responds (HTTP ${API_STATUS})${NC}"
else
    echo -e "${RED}❌ Strapi API endpoint error (HTTP ${API_STATUS})${NC}"
fi
echo ""

# Test 4: Check Sales content type
echo -e "${BLUE}Test 4: Checking Sales content type...${NC}"
SALES_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${STRAPI_URL}/api/sales")
if [ "$SALES_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Sales endpoint is accessible (HTTP 200)${NC}"
    SALES_DATA=$(curl -s "${STRAPI_URL}/api/sales")
    echo "   Response: ${SALES_DATA:0:100}..."
elif [ "$SALES_STATUS" = "403" ]; then
    echo -e "${YELLOW}⚠️  Sales endpoint exists but requires authentication (HTTP 403)${NC}"
    echo "   Solution: Make Strapi public or add authentication"
elif [ "$SALES_STATUS" = "404" ]; then
    echo -e "${RED}❌ Sales content type not found (HTTP 404)${NC}"
    echo "   Solution: Content type may not be registered"
    echo "   Fix: Restart Strapi to register content types"
else
    echo -e "${RED}❌ Unexpected response (HTTP ${SALES_STATUS})${NC}"
fi
echo ""

# Test 5: Check Frontend API route
echo -e "${BLUE}Test 5: Checking Frontend API route...${NC}"
FRONTEND_API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${FRONTEND_URL}/api/sales")
if [ "$FRONTEND_API_STATUS" = "200" ] || [ "$FRONTEND_API_STATUS" = "405" ]; then
    if [ "$FRONTEND_API_STATUS" = "200" ]; then
        echo -e "${GREEN}✅ Frontend API route is accessible (HTTP 200)${NC}"
    else
        echo -e "${YELLOW}⚠️  Frontend API route exists but method not allowed (HTTP 405)${NC}"
        echo "   Solution: Restart Next.js server"
    fi
else
    echo -e "${RED}❌ Frontend API route error (HTTP ${FRONTEND_API_STATUS})${NC}"
fi
echo ""

# Test 6: Check environment variables
echo -e "${BLUE}Test 6: Checking Frontend environment variables...${NC}"
if [ -f "project/frontend/.env.local" ]; then
    echo -e "${GREEN}✅ Frontend .env.local file exists${NC}"
    STRAPI_ENV=$(grep "NEXT_PUBLIC_STRAPI_URL" project/frontend/.env.local | cut -d '=' -f2 || echo "not found")
    if [ "$STRAPI_ENV" != "not found" ]; then
        echo "   NEXT_PUBLIC_STRAPI_URL: ${STRAPI_ENV}"
    else
        echo -e "${YELLOW}⚠️  NEXT_PUBLIC_STRAPI_URL not set in .env.local${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Frontend .env.local file not found${NC}"
    echo "   Create it: cp project/frontend/env.example project/frontend/.env.local"
fi
echo ""

# Test 7: Test connection from Frontend to Strapi
echo -e "${BLUE}Test 7: Testing Frontend → Strapi connection...${NC}"
FRONTEND_TO_STRAPI=$(curl -s -X GET "${FRONTEND_URL}/api/sales" -w "\nHTTP_STATUS:%{http_code}" 2>&1 | tail -1)
if echo "$FRONTEND_TO_STRAPI" | grep -q "HTTP_STATUS:200"; then
    echo -e "${GREEN}✅ Frontend can successfully connect to Strapi${NC}"
elif echo "$FRONTEND_TO_STRAPI" | grep -q "HTTP_STATUS:404"; then
    echo -e "${YELLOW}⚠️  Frontend connects but Strapi returns 404${NC}"
    echo "   Issue: Sales content type not registered in Strapi"
elif echo "$FRONTEND_TO_STRAPI" | grep -q "HTTP_STATUS:403"; then
    echo -e "${YELLOW}⚠️  Frontend connects but Strapi requires authentication${NC}"
    echo "   Issue: Make Strapi public or add authentication"
else
    echo -e "${RED}❌ Frontend cannot connect to Strapi${NC}"
    echo "   Response: ${FRONTEND_TO_STRAPI}"
fi
echo ""

# Summary
echo "=========================================="
echo -e "${BLUE}📊 Connection Summary${NC}"
echo "=========================================="
echo ""

if [ "$SALES_STATUS" = "404" ]; then
    echo -e "${RED}❌ MAIN ISSUE: Sales content type not registered${NC}"
    echo ""
    echo "Fix Steps:"
    echo "1. Restart Strapi:"
    echo "   cd project/strapi && npm run develop"
    echo ""
    echo "2. Check Strapi console for:"
    echo "   - Content types being registered"
    echo "   - Any error messages"
    echo ""
    echo "3. If content type still not found:"
    echo "   - Open Strapi admin: http://localhost:1337/admin"
    echo "   - Go to Content-Type Builder"
    echo "   - Check if 'Sale' content type exists"
    echo ""
elif [ "$SALES_STATUS" = "403" ]; then
    echo -e "${YELLOW}⚠️  MAIN ISSUE: Strapi requires authentication${NC}"
    echo ""
    echo "Fix Steps:"
    echo "1. Make Strapi public:"
    echo "   - Open: http://localhost:1337/admin"
    echo "   - Settings → Roles → Public"
    echo "   - Enable permissions for 'sale' content type"
    echo ""
    echo "2. OR restart Strapi (bootstrap script should handle this)"
    echo ""
else
    echo -e "${GREEN}✅ Strapi and Frontend are both running${NC}"
    echo ""
    echo "Next Steps:"
    echo "- Test creating a sale entry in the frontend"
    echo "- Check browser console for any errors"
fi

echo ""
echo "For more help, see:"
echo "- project/strapi/MAKE_PUBLIC_QUICK.md"
echo "- FIX_ERRORS_ACTION_PLAN.md"



