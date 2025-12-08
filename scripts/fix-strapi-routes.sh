#!/bin/bash

# Script to fix Strapi 404 errors by cleaning and restarting

set -e

echo "🔧 Fixing Strapi API Routes (404 Errors)"
echo "=========================================="
echo ""

cd "$(dirname "$0")/../project/strapi" || exit 1

# Check if Strapi is running
if pgrep -f "strapi develop" > /dev/null; then
  echo "⚠️  Strapi is currently running"
  echo ""
  echo "📋 Please STOP Strapi first:"
  echo "   1. Go to the terminal where Strapi is running"
  echo "   2. Press Ctrl+C to stop it"
  echo "   3. Then run this script again"
  echo ""
  read -p "Press Enter after you've stopped Strapi, or Ctrl+C to cancel..."
fi

echo "🧹 Cleaning Strapi build artifacts..."
echo ""

# Clean cache and build files
rm -rf .cache 2>/dev/null && echo "  ✅ Removed .cache"
rm -rf build 2>/dev/null && echo "  ✅ Removed build"
rm -rf dist 2>/dev/null && echo "  ✅ Removed dist"
rm -rf .strapi 2>/dev/null && echo "  ✅ Removed .strapi"

echo ""
echo "✅ Clean complete!"
echo ""
echo "🚀 Starting Strapi..."
echo ""
echo "📋 What to watch for:"
echo "   1. 'Content Types loaded' message"
echo "   2. 'Routes registered' messages"
echo "   3. '✅ Public permissions configured' (from bootstrap)"
echo "   4. Any error messages (red text)"
echo ""
echo "💡 After Strapi starts, test with:"
echo "   curl http://localhost:1337/api/sales"
echo ""

# Start Strapi
npm run develop

