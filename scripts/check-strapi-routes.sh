#!/bin/bash

# Diagnostic script to check what routes Strapi has registered

echo "🔍 Checking Strapi Route Registration"
echo "======================================"
echo ""

# Check if Strapi is running
if ! pgrep -f "strapi develop" > /dev/null; then
  echo "❌ Strapi is not running"
  echo "   Start it with: cd project/strapi && npm run develop"
  exit 1
fi

echo "✅ Strapi is running"
echo ""

# Test all known endpoints
echo "📡 Testing API Endpoints:"
echo ""

ENDPOINTS=(
  "/api/clients"
  "/api/projects"
  "/api/sales"
  "/api/pipeline-deals"
  "/api/billings"
)

for endpoint in "${ENDPOINTS[@]}"; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:1337$endpoint" 2>/dev/null)
  if [ "$status" = "200" ] || [ "$status" = "401" ] || [ "$status" = "403" ]; then
    echo "  ✅ $endpoint - HTTP $status (route exists)"
  elif [ "$status" = "404" ]; then
    echo "  ❌ $endpoint - HTTP 404 (route NOT registered)"
  else
    echo "  ⚠️  $endpoint - HTTP $status"
  fi
done

echo ""
echo "💡 If all endpoints return 404:"
echo "   1. Check Strapi console for errors during startup"
echo "   2. Verify content types appear in admin panel: http://localhost:1337/admin"
echo "   3. Check if content types are being loaded (should see 'Content Types loaded' in console)"
echo "   4. Try: cd project/strapi && rm -rf .cache build dist && npm run develop"
echo ""


