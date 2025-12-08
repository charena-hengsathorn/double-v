#!/bin/bash

# Script to create a Strapi admin user
# Usage: ./scripts/create-strapi-admin.sh

set -e

echo "🔐 Creating Strapi Admin User"
echo "================================"
echo ""

cd "$(dirname "$0")/../project/strapi" || exit 1

echo "📋 This will create a new admin user for Strapi"
echo ""

# Check if Strapi is running
if ! pgrep -f "strapi develop" > /dev/null; then
  echo "⚠️  Strapi is not running!"
  echo "   Please start Strapi first:"
  echo "   cd project/strapi && npm run develop"
  echo ""
  exit 1
fi

echo "✅ Strapi is running"
echo ""
echo "🌐 Open your browser and go to:"
echo "   http://localhost:1337/admin"
echo ""
echo "📝 If this is the first time, Strapi will prompt you to create an admin user."
echo "   Fill in the registration form with:"
echo "   - First name"
echo "   - Last name"
echo "   - Email"
echo "   - Password (min 8 characters)"
echo ""
echo "💡 If you already have an admin user but forgot credentials,"
echo "   you can reset the admin password by:"
echo "   1. Going to http://localhost:1337/admin/forgot-password"
echo "   2. Or deleting the admin user from the database and recreating"
echo ""

# Check if we can access the admin endpoint
if curl -s -o /dev/null -w "%{http_code}" http://localhost:1337/admin | grep -q "200\|302"; then
  echo "✅ Admin panel is accessible"
else
  echo "⚠️  Cannot access admin panel. Make sure Strapi is running on port 1337"
fi

echo ""
echo "🎯 Once logged in, you'll be able to access all admin features including:"
echo "   - Content Manager"
echo "   - Settings → Roles"
echo "   - Users & Permissions Plugin"
echo ""

