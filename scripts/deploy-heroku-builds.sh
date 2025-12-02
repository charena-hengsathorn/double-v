#!/bin/bash

# Deploy to Heroku using builds:create (works with monorepo)
# This method creates a tarball of the subdirectory and deploys it

set -e

echo "🚀 Deploying to Heroku using builds:create"
echo "==========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -d "project/strapi" ] || [ ! -d "project/predictive-service" ]; then
    echo -e "${RED}❌ Error: Must run from project root${NC}"
    exit 1
fi

# Check Heroku CLI
if ! command -v heroku &> /dev/null; then
    echo -e "${RED}❌ Heroku CLI not found. Please install it first.${NC}"
    exit 1
fi

# Check authentication
echo "🔐 Checking Heroku authentication..."
if ! heroku auth:whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not authenticated. Please run: heroku login${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Authenticated as $(heroku auth:whoami)${NC}"
echo ""

# Deploy Strapi
echo "📦 Deploying Strapi to Heroku..."
echo ""

cd project/strapi

# Create a tarball of the current directory
TEMP_DIR=$(mktemp -d)
TARBALL="$TEMP_DIR/strapi.tar.gz"

echo "Creating tarball..."
tar --exclude='.git' --exclude='node_modules' --exclude='.next' \
    -czf "$TARBALL" .

echo "Uploading to Heroku..."
heroku builds:create -a double-v-strapi --source-tar "$TARBALL" 2>&1 | tail -20

if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo -e "${GREEN}✅ Strapi deployment initiated${NC}"
else
    echo -e "${RED}❌ Strapi deployment failed${NC}"
    rm -rf "$TEMP_DIR"
    exit 1
fi

rm -rf "$TEMP_DIR"
cd ../..

echo ""

# Deploy Predictive Service
echo "📦 Deploying Predictive Service to Heroku..."
echo ""

cd project/predictive-service

# Create a tarball of the current directory
TEMP_DIR=$(mktemp -d)
TARBALL="$TEMP_DIR/predictive.tar.gz"

echo "Creating tarball..."
tar --exclude='.git' --exclude='__pycache__' --exclude='*.pyc' \
    --exclude='.pytest_cache' --exclude='venv' --exclude='env' \
    -czf "$TARBALL" .

echo "Uploading to Heroku..."
heroku builds:create -a double-v-predictive --source-tar "$TARBALL" 2>&1 | tail -20

if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo -e "${GREEN}✅ Predictive Service deployment initiated${NC}"
else
    echo -e "${RED}❌ Predictive Service deployment failed${NC}"
    rm -rf "$TEMP_DIR"
    exit 1
fi

rm -rf "$TEMP_DIR"
cd ../..

echo ""
echo "==========================================="
echo -e "${GREEN}✅ Deployment requests submitted!${NC}"
echo ""
echo "Check deployment status:"
echo "  heroku builds -a double-v-strapi"
echo "  heroku builds -a double-v-predictive"
echo ""
echo "View logs:"
echo "  heroku logs --tail -a double-v-strapi"
echo "  heroku logs --tail -a double-v-predictive"

