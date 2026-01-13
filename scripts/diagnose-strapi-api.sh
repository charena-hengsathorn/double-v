#!/bin/bash

# Diagnostic script to check Strapi API endpoints and permissions

echo "🔍 Strapi API Diagnostic"
echo "========================"
echo ""

cd "$(dirname "$0")/.." || exit 1

# Check if Strapi is running
if ! pgrep -f "strapi develop" > /dev/null; then
  echo "❌ Strapi is NOT running"
  echo "   Start it with: cd project/strapi && npm run develop"
  exit 1
fi

echo "✅ Strapi is running"
echo ""

# Test various endpoints
echo "📡 Testing API Endpoints:"
echo ""

ENDPOINTS=(
  "/api/sales"
  "/api/clients"
  "/api/projects"
  "/api/billings"
  "/api/pipeline-deals"
)

for endpoint in "${ENDPOINTS[@]}"; do
  echo -n "  Testing $endpoint ... "
  response=$(curl -s -w "\n%{http_code}" "http://localhost:1337$endpoint" 2>&1)
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)
  
  case "$http_code" in
    200)
      echo "✅ OK (200)"
      ;;
    401)
      echo "⚠️  Unauthorized (401) - Permissions issue"
      ;;
    403)
      echo "⚠️  Forbidden (403) - Permissions issue"
      ;;
    404)
      echo "❌ Not Found (404) - Route doesn't exist"
      ;;
    500)
      echo "❌ Server Error (500)"
      echo "$body" | head -3
      ;;
    *)
      echo "⚠️  Unexpected ($http_code)"
      ;;
  esac
done

echo ""
echo "🔍 Checking Content Types:"
echo ""

cd project/strapi || exit 1

if [ -d "src/api" ]; then
  echo "✅ API directory exists"
  content_types=$(find src/api -name "schema.json" -type f | wc -l | tr -d ' ')
  echo "   Found $content_types content types:"
  find src/api -name "schema.json" -type f | while read -r schema; do
    dir=$(dirname "$(dirname "$schema")")
    name=$(basename "$dir")
    plural=$(grep -o '"pluralName": "[^"]*"' "$schema" | cut -d'"' -f4 || echo "unknown")
    echo "     - $name (plural: $plural)"
  done
else
  echo "❌ API directory not found"
fi

echo ""
echo "💡 If all endpoints return 404:"
echo "   1. Restart Strapi to regenerate routes"
echo "   2. Check Strapi console for build errors"
echo "   3. Verify content types are in src/api/"
echo ""
echo "💡 If endpoints return 401/403:"
echo "   1. Check bootstrap script ran (look for '✅ Public permissions configured')"
echo "   2. Verify permissions in admin panel"
echo ""



