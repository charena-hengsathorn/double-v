#!/bin/bash

# Double V Deployment Setup Script
# This script helps verify and complete the deployment setup

set -e

echo "🚀 Double V Deployment Setup"
echo "============================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check GitHub secrets
echo "📋 Checking GitHub Secrets..."
if gh secret list | grep -q HEROKU_API_KEY; then
    echo -e "${GREEN}✅ HEROKU_API_KEY${NC}"
else
    echo -e "${RED}❌ HEROKU_API_KEY missing${NC}"
fi

if gh secret list | grep -q HEROKU_EMAIL; then
    echo -e "${GREEN}✅ HEROKU_EMAIL${NC}"
else
    echo -e "${RED}❌ HEROKU_EMAIL missing${NC}"
fi

if gh secret list | grep -q HEROKU_STRAPI_APP_NAME; then
    echo -e "${GREEN}✅ HEROKU_STRAPI_APP_NAME${NC}"
else
    echo -e "${RED}❌ HEROKU_STRAPI_APP_NAME missing${NC}"
fi

if gh secret list | grep -q HEROKU_PREDICTIVE_APP_NAME; then
    echo -e "${GREEN}✅ HEROKU_PREDICTIVE_APP_NAME${NC}"
else
    echo -e "${RED}❌ HEROKU_PREDICTIVE_APP_NAME missing${NC}"
fi

echo ""

# Check Heroku apps
echo "🔍 Checking Heroku Apps..."
if heroku apps:info double-v-strapi &>/dev/null; then
    echo -e "${GREEN}✅ double-v-strapi exists${NC}"
    STRAPI_URL=$(heroku info -a double-v-strapi | grep "Web URL" | awk '{print $3}')
    echo "   URL: $STRAPI_URL"
else
    echo -e "${RED}❌ double-v-strapi not found${NC}"
fi

if heroku apps:info double-v-predictive &>/dev/null; then
    echo -e "${GREEN}✅ double-v-predictive exists${NC}"
    PREDICTIVE_URL=$(heroku info -a double-v-predictive | grep "Web URL" | awk '{print $3}')
    echo "   URL: $PREDICTIVE_URL"
else
    echo -e "${RED}❌ double-v-predictive not found${NC}"
fi

echo ""

# Check Vercel project
echo "🌐 Checking Vercel Project..."
if [ -f "project/frontend/.vercel/project.json" ]; then
    echo -e "${GREEN}✅ Vercel project linked${NC}"
    PROJECT_ID=$(cat project/frontend/.vercel/project.json | grep -o '"projectId":"[^"]*' | cut -d'"' -f4)
    ORG_ID=$(cat project/frontend/.vercel/project.json | grep -o '"orgId":"[^"]*' | cut -d'"' -f4)
    echo "   Project ID: $PROJECT_ID"
    echo "   Org ID: $ORG_ID"
else
    echo -e "${YELLOW}⚠️  Vercel project not linked${NC}"
fi

echo ""

# Check if services are scaffolded
echo "📦 Checking Service Scaffolding..."
if [ -f "project/strapi/package.json" ]; then
    echo -e "${GREEN}✅ Strapi scaffolded${NC}"
else
    echo -e "${YELLOW}⚠️  Strapi not scaffolded yet${NC}"
fi

if [ -f "project/predictive-service/requirements.txt" ] || [ -f "project/predictive-service/pyproject.toml" ]; then
    echo -e "${GREEN}✅ Predictive Service scaffolded${NC}"
else
    echo -e "${YELLOW}⚠️  Predictive Service not scaffolded yet${NC}"
fi

if [ -f "project/frontend/package.json" ]; then
    echo -e "${GREEN}✅ Frontend scaffolded${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend not scaffolded yet${NC}"
fi

echo ""
echo "============================"
echo "📝 Next Steps:"
echo ""
echo "1. If services aren't scaffolded, start AI Execution Plan Phase 2"
echo "2. After scaffolding, services can be deployed via:"
echo "   - GitHub Actions (automatic on push to main)"
echo "   - Manual deployment commands (see docs/deployment-guide.md)"
echo ""
echo "3. Configure Strapi API token after Strapi is deployed:"
echo "   - Go to Strapi admin panel"
echo "   - Create API token"
echo "   - Set STRAPI_API_TOKEN in double-v-predictive Heroku app"
echo ""
echo "4. Set up webhooks and scheduled jobs (see docs/deployment-status.md)"
echo ""




