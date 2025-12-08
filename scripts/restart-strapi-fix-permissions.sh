#!/bin/bash
# Quick script to restart Strapi and verify permissions are set

echo "🔄 Restarting Strapi to apply public permissions..."
echo ""
echo "📋 Instructions:"
echo "1. Stop Strapi if it's running (Ctrl+C in the Strapi terminal)"
echo "2. Run: cd project/strapi && npm run develop"
echo "3. Watch for: '✅ Public permissions configured' in console"
echo "4. Test: curl http://localhost:1337/api/sales"
echo ""
echo "💡 The bootstrap script in src/index.ts will automatically"
echo "   set all public permissions when Strapi starts."
