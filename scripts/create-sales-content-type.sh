#!/bin/bash

# Script to help create Sales content type in Strapi
# This provides instructions and can verify the setup

set -e

echo "📦 Sales Content Type Setup for Strapi"
echo "======================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if Strapi is running
if ! curl -s http://localhost:1337/admin > /dev/null; then
    echo -e "${RED}❌ Strapi is not running${NC}"
    echo "Please start Strapi first:"
    echo "  cd project/strapi"
    echo "  npm run develop"
    exit 1
fi

echo -e "${GREEN}✅ Strapi is running${NC}"
echo ""

# Check if schema file exists
if [ -f "project/strapi/src/api/sale/content-types/sale/schema.json" ]; then
    echo -e "${GREEN}✅ Sales schema file exists${NC}"
else
    echo -e "${RED}❌ Sales schema file not found${NC}"
    exit 1
fi

echo ""
echo "📋 Next Steps:"
echo "=============="
echo ""
echo "The Sales content type schema exists, but it needs to be registered in Strapi admin."
echo ""
echo "1. Open Strapi Admin:"
echo "   http://localhost:1337/admin"
echo ""
echo "2. Go to Content-Type Builder (left sidebar)"
echo ""
echo "3. Check if 'Sales' appears in the collection types list"
echo ""
echo "4. If it DOES exist:"
echo "   - Go to Settings → Users & Permissions → Roles → Public"
echo "   - Find 'Sales' section"
echo "   - Enable: find, findOne, create, update, delete"
echo "   - Save"
echo ""
echo "5. If it DOES NOT exist:"
echo "   - Click 'Create new collection type'"
echo "   - Display name: Sales"
echo "   - API ID (singular): sale"
echo "   - API ID (plural): sales"
echo "   - Click Continue"
echo ""
echo "6. Add these fields:"
echo "   - client (Text, required)"
echo "   - sale_amount (Number - Decimal, required)"
echo "   - construction_cost (Number - Decimal, required)"
echo "   - project_profit (Number - Decimal, required)"
echo "   - status (Enumeration: Confirmed, Pending, Closed, default: Pending, required)"
echo "   - notes (Long text, optional)"
echo ""
echo "7. Click Save"
echo ""
echo "8. Set permissions (Settings → Users & Permissions → Roles → Public)"
echo ""
echo "9. Restart Strapi to ensure changes are loaded"
echo ""
echo "10. Test the endpoint:"
echo "    curl http://localhost:1337/api/sales"
echo ""

