#!/bin/bash

# Quick deployment script - streamlined version

set -e

echo "🚀 Quick Deployment"
echo "==================="
echo ""

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Step 1: Git
echo -e "${BLUE}📤 Step 1: Pushing to Git...${NC}"
echo ""

git add .
git commit -m "Deploy: Add API server, fix authentication, update environment config" || echo "Nothing to commit or already committed"
git push origin main

echo -e "${GREEN}✅ Git push complete${NC}"
echo ""

# Step 2: Deploy Strapi
echo -e "${BLUE}📦 Step 2: Deploying Strapi to Heroku...${NC}"
echo ""

git subtree push --prefix project/strapi heroku-strapi main

echo -e "${GREEN}✅ Strapi deployed${NC}"
echo ""

# Step 3: Deploy Predictive Service
echo -e "${BLUE}📦 Step 3: Deploying Predictive Service to Heroku...${NC}"
echo ""

git subtree push --prefix project/predictive-service heroku-predictive main

echo -e "${GREEN}✅ Predictive Service deployed${NC}"
echo ""

# Step 4: Vercel
echo -e "${BLUE}🌐 Step 4: Frontend to Vercel...${NC}"
echo ""

cd project/frontend
if command -v vercel &> /dev/null; then
    vercel --prod
    echo -e "${GREEN}✅ Frontend deployed to Vercel${NC}"
else
    echo -e "${YELLOW}⚠️  Vercel CLI not found${NC}"
    echo "   Install: npm i -g vercel"
    echo "   Or deploy via Vercel dashboard (auto-deploys on git push)"
fi

cd "$PROJECT_ROOT"

echo ""
echo "=============================="
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo "=============================="
echo ""
echo "Services:"
echo "  📦 Strapi: https://double-v-strapi-dd98523889e0.herokuapp.com"
echo "  📦 Predictive: https://double-v-predictive-10a3079347ff.herokuapp.com"
echo "  🌐 Frontend: Check Vercel dashboard"



