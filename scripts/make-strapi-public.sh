#!/bin/bash

# Script to help make Strapi content types public
# This provides instructions and checks current status

set -e

echo "🔓 Making Strapi Public - Helper Script"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}There are two ways to make Strapi public:${NC}"
echo ""
echo "1. ${GREEN}Using Admin Panel (Recommended)${NC}"
echo "2. ${GREEN}Automatic via Bootstrap Script${NC}"
echo ""

echo "========================================"
echo -e "${BLUE}Method 1: Using Admin Panel${NC}"
echo "========================================"
echo ""
echo "Steps:"
echo "1. Make sure Strapi is running:"
echo "   cd project/strapi && npm run develop"
echo ""
echo "2. Open admin panel:"
echo "   http://localhost:1337/admin"
echo ""
echo "3. Go to: Settings → Users & Permissions Plugin → Roles → Public"
echo ""
echo "4. For each content type, enable:"
echo "   ✅ find"
echo "   ✅ findOne"
echo "   ✅ create (optional)"
echo "   ✅ update (optional)"
echo "   ✅ delete (optional)"
echo ""
echo "5. Click Save button"
echo ""
echo "6. Test: curl http://localhost:1337/api/sales"
echo ""

echo "========================================"
echo -e "${BLUE}Method 2: Automatic (Bootstrap)${NC}"
echo "========================================"
echo ""
echo "The bootstrap script in src/index.ts will automatically enable"
echo "public permissions on Strapi startup."
echo ""
echo "To use:"
echo "1. Restart Strapi:"
echo "   cd project/strapi"
echo "   npm run develop"
echo ""
echo "2. Check console for:"
echo "   ✅ Public permissions configured for all content types"
echo ""

echo "========================================"
echo -e "${BLUE}Testing Public Access${NC}"
echo "========================================"
echo ""

# Check if Strapi is running
STRAPI_URL="${STRAPI_URL:-http://localhost:1337}"

echo "Checking if Strapi is accessible..."
if curl -s -o /dev/null -w "%{http_code}" "${STRAPI_URL}/api" | grep -q "200\|404"; then
    echo -e "${GREEN}✅ Strapi is running${NC}"
    echo ""
    
    echo "Testing public access to /api/sales..."
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${STRAPI_URL}/api/sales")
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✅ Public access is working!${NC}"
        echo "   HTTP Status: 200 OK"
    elif [ "$HTTP_CODE" = "403" ]; then
        echo -e "${YELLOW}⚠️  Strapi is not public yet (403 Forbidden)${NC}"
        echo "   Follow Method 1 above to enable public access"
    elif [ "$HTTP_CODE" = "404" ]; then
        echo -e "${YELLOW}⚠️  Endpoint not found (404)${NC}"
        echo "   Content type might not be registered"
        echo "   Restart Strapi to register content types"
    else
        echo -e "${YELLOW}⚠️  Unexpected response: HTTP ${HTTP_CODE}${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Strapi is not running or not accessible${NC}"
    echo "   Start Strapi: cd project/strapi && npm run develop"
fi

echo ""
echo "========================================"
echo -e "${BLUE}Content Types to Make Public${NC}"
echo "========================================"
echo ""
echo "Based on your project, consider making these public:"
echo "  - sale (sales)"
echo "  - client"
echo "  - pipeline-deal"
echo "  - project"
echo "  - billing"
echo "  - forecast-snapshot"
echo "  - risk-flag"
echo ""

echo "========================================"
echo -e "${BLUE}Security Note${NC}"
echo "========================================"
echo ""
echo -e "${YELLOW}⚠️  For production, consider:${NC}"
echo "  - Use read-only public access (find, findOne only)"
echo "  - Use API tokens instead of full public access"
echo "  - Restrict which content types are public"
echo ""

echo "For more details, see: project/strapi/MAKE_PUBLIC_GUIDE.md"

