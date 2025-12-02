#!/bin/bash

# Deploy to Heroku using CLI
# This script uses git subtree to push subdirectories to Heroku apps

set -e

echo "🚀 Deploying to Heroku"
echo "======================"
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

# Set up remote if it doesn't exist
if ! git remote get-url heroku &> /dev/null; then
    heroku git:remote -a double-v-strapi
fi

# Push to Heroku
echo "Pushing to Heroku (this may take a few minutes)..."
git push heroku main 2>&1 | tail -20

if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo -e "${GREEN}✅ Strapi deployed successfully${NC}"
else
    echo -e "${RED}❌ Strapi deployment failed${NC}"
    exit 1
fi

cd ../..

echo ""

# Deploy Predictive Service
echo "📦 Deploying Predictive Service to Heroku..."
echo ""

cd project/predictive-service

# Set up remote if it doesn't exist
if ! git remote get-url heroku &> /dev/null; then
    heroku git:remote -a double-v-predictive
fi

# Push to Heroku
echo "Pushing to Heroku (this may take a few minutes)..."
git push heroku main 2>&1 | tail -20

if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo -e "${GREEN}✅ Predictive Service deployed successfully${NC}"
else
    echo -e "${RED}❌ Predictive Service deployment failed${NC}"
    exit 1
fi

cd ../..

echo ""
echo "======================"
echo -e "${GREEN}✅ All deployments complete!${NC}"
echo ""
echo "Strapi: https://double-v-strapi.herokuapp.com"
echo "Predictive Service: https://double-v-predictive.herokuapp.com"

