#!/bin/bash

# Script to fix Strapi public permissions
# This restarts Strapi to trigger the bootstrap script that sets public permissions

set -e

echo "🔧 Fixing Strapi Public Permissions"
echo "===================================="
echo ""

cd "$(dirname "$0")/../project/strapi" || exit 1

# Check if Strapi is running
if ! pgrep -f "strapi develop" > /dev/null; then
  echo "⚠️  Strapi is not running!"
  echo "   Starting Strapi in development mode..."
  echo ""
  npm run develop &
  STRAPI_PID=$!
  echo "   Strapi started (PID: $STRAPI_PID)"
  echo "   Waiting for Strapi to initialize..."
  sleep 15
else
  echo "✅ Strapi is running"
  echo ""
  echo "🔄 The bootstrap script should have already set public permissions."
  echo "   If you're still having issues, try:"
  echo ""
  echo "   1. Stop Strapi (Ctrl+C in the terminal running Strapi)"
  echo "   2. Restart Strapi: cd project/strapi && npm run develop"
  echo "   3. Check the console for: '✅ Public permissions configured for all content types'"
  echo ""
fi

echo ""
echo "📋 To verify permissions are set:"
echo ""
echo "   Option 1: Check via API (should work without auth)"
echo "   curl http://localhost:1337/api/sales"
echo ""
echo "   Option 2: Check in Admin Panel"
echo "   1. Go to: http://localhost:1337/admin"
echo "   2. Navigate to: Settings → Users & Permissions Plugin → Roles → Public"
echo "   3. You should see all permissions enabled (green checkmarks)"
echo ""
echo "   Option 3: Check Strapi console logs"
echo "   Look for: '✅ Public permissions configured for all content types'"
echo ""

echo "💡 If permissions are still not working:"
echo "   1. The bootstrap script in src/index.ts should run on startup"
echo "   2. Make sure all content types exist in Strapi"
echo "   3. Check for errors in Strapi console"
echo ""



