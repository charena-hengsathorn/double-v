#!/bin/bash

# Correct Heroku Deployment Script
# Always run from project root!

set -e

echo "🚀 Deploying to Heroku (Correct Method)"
echo "======================================="
echo ""

# Check we're in the right directory
if [ ! -d "project/strapi" ] || [ ! -d "project/predictive-service" ]; then
    echo "❌ Error: Must run from project root"
    echo "   Current directory: $(pwd)"
    echo "   Expected: /Users/charena/Projects/double-v"
    exit 1
fi

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Deploy Strapi
echo "📦 Deploying Strapi..."
git subtree push --prefix project/strapi heroku-strapi main

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Strapi deployed successfully${NC}"
else
    echo -e "${RED}❌ Strapi deployment failed${NC}"
    exit 1
fi

echo ""

# Deploy Predictive Service
echo "📦 Deploying Predictive Service..."
git subtree push --prefix project/predictive-service heroku-predictive main

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Predictive Service deployed successfully${NC}"
else
    echo -e "${RED}❌ Predictive Service deployment failed${NC}"
    exit 1
fi

echo ""
echo "======================================="
echo -e "${GREEN}✅ All deployments complete!${NC}"
echo ""
echo "Strapi: https://double-v-strapi-dd98523889e0.herokuapp.com/"
echo "Predictive: https://double-v-predictive-10a3079347ff.herokuapp.com/"
