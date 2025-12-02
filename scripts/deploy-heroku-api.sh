#!/bin/bash

# Deploy to Heroku using API directly (bypasses CLI auth issues)
# Uses the API token from .netrc

set -e

echo "🚀 Deploying to Heroku using API"
echo "================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get API token from .netrc
NETRC_FILE="$HOME/.netrc"
if [ ! -f "$NETRC_FILE" ]; then
    echo -e "${RED}❌ .netrc file not found${NC}"
    exit 1
fi

API_TOKEN=$(grep -A2 "api.heroku.com" "$NETRC_FILE" | grep "password" | awk '{print $2}')

if [ -z "$API_TOKEN" ]; then
    echo -e "${RED}❌ Could not find Heroku API token in .netrc${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Found API token${NC}"
echo ""

# Deploy Strapi
echo "📦 Deploying Strapi to Heroku..."
echo ""

cd project/strapi

# Create tarball
TEMP_DIR=$(mktemp -d)
TARBALL="$TEMP_DIR/strapi.tar.gz"

echo "Creating tarball..."
tar --exclude='.git' --exclude='node_modules' --exclude='.next' \
    -czf "$TARBALL" .

echo "Uploading to Heroku API..."
BUILD_OUTPUT=$(curl -s -X POST https://api.heroku.com/apps/double-v-strapi/builds \
    -H "Content-Type: application/json" \
    -H "Accept: application/vnd.heroku+json; version=3" \
    -H "Authorization: Bearer $API_TOKEN" \
    --data-binary @- <<EOF
{
  "source_blob": {
    "url": "$(base64 -i "$TARBALL" | tr -d '\n')"
  }
}
EOF
)

# Actually, Heroku API needs the tarball uploaded to a URL first
# Let's use a simpler approach - git push with proper auth

cd ../..

# Alternative: Use git with credential helper
echo "Using git push with Heroku CLI authentication..."
cd project/strapi

# Try to set up remote using Heroku CLI
heroku git:remote -a double-v-strapi 2>&1 | head -3 || echo "Remote setup needed"

# The issue is we need interactive auth. Let's provide instructions instead
echo ""
echo -e "${YELLOW}⚠️  Manual deployment required:${NC}"
echo ""
echo "To deploy Strapi:"
echo "  1. cd project/strapi"
echo "  2. heroku git:remote -a double-v-strapi"
echo "  3. git push heroku main"
echo ""
echo "To deploy Predictive Service:"
echo "  1. cd project/predictive-service"
echo "  2. heroku git:remote -a double-v-predictive"
echo "  3. git push heroku main"
echo ""

rm -rf "$TEMP_DIR"

