#!/bin/bash

# Script to cleanly restart Strapi to register routes

set -e

echo "🔄 Restarting Strapi..."
echo ""

cd "$(dirname "$0")/../project/strapi" || exit 1

# Kill existing Strapi process
echo "🛑 Stopping existing Strapi..."
pkill -f "strapi develop" 2>/dev/null || true
sleep 2

# Clean cache
echo "🧹 Cleaning cache..."
rm -rf .cache build dist 2>/dev/null || true

# Start Strapi
echo "🚀 Starting Strapi..."
echo ""
echo "Watch for these messages:"
echo "  ✅ Content Types loaded"
echo "  ✅ Routes registered"
echo "  ✅ Public permissions configured"
echo ""
echo "Press Ctrl+C to stop Strapi"
echo ""

npm run develop



