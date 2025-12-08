#!/bin/bash

# Complete deployment script for Git, Vercel, and Heroku

set -e

echo "🚀 Complete Deployment Script"
echo "=============================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Step 1: Git Status Check
echo -e "${BLUE}Step 1: Checking Git Status${NC}"
echo "=============================="
echo ""

if ! git diff --quiet || ! git diff --cached --quiet || [ -n "$(git ls-files --others --exclude-standard)" ]; then
    echo -e "${YELLOW}⚠️  You have uncommitted changes${NC}"
    echo ""
    echo "Modified files:"
    git status --short | head -20
    echo ""
    read -p "Do you want to commit and push these changes? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled. Commit changes first."
        exit 1
    fi
    
    # Add all changes
    echo -e "${BLUE}Adding all changes...${NC}"
    git add .
    
    # Commit
    echo -e "${BLUE}Creating commit...${NC}"
    read -p "Enter commit message (or press Enter for default): " COMMIT_MSG
    if [ -z "$COMMIT_MSG" ]; then
        COMMIT_MSG="Deploy: Update project files and add API server"
    fi
    
    git commit -m "$COMMIT_MSG"
    echo -e "${GREEN}✅ Changes committed${NC}"
    echo ""
else
    echo -e "${GREEN}✅ Working directory is clean${NC}"
    echo ""
fi

# Step 2: Push to Git
echo -e "${BLUE}Step 2: Pushing to Git${NC}"
echo "=============================="
echo ""

read -p "Push to git? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}Pushing to origin/main...${NC}"
    git push origin main
    echo -e "${GREEN}✅ Pushed to Git${NC}"
else
    echo -e "${YELLOW}⚠️  Skipped Git push${NC}"
fi
echo ""

# Step 3: Deploy to Heroku (Strapi)
echo -e "${BLUE}Step 3: Deploying Strapi to Heroku${NC}"
echo "=============================="
echo ""

read -p "Deploy Strapi to Heroku? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}Deploying Strapi...${NC}"
    echo "Using git subtree push..."
    
    # Check if Heroku remote exists
    if git remote | grep -q "heroku-strapi"; then
        git subtree push --prefix project/strapi heroku-strapi main
    else
        echo -e "${YELLOW}⚠️  Heroku remote 'heroku-strapi' not found${NC}"
        echo "Creating Heroku app..."
        read -p "Enter Heroku app name for Strapi (or press Enter for default): " STRAPI_APP
        if [ -z "$STRAPI_APP" ]; then
            STRAPI_APP="double-v-strapi"
        fi
        
        heroku git:remote -a "$STRAPI_APP" -r heroku-strapi 2>/dev/null || \
        heroku create "$STRAPI_APP" -r heroku-strapi
        
        git subtree push --prefix project/strapi heroku-strapi main
    fi
    
    echo -e "${GREEN}✅ Strapi deployed to Heroku${NC}"
else
    echo -e "${YELLOW}⚠️  Skipped Strapi deployment${NC}"
fi
echo ""

# Step 4: Deploy to Heroku (Predictive Service)
echo -e "${BLUE}Step 4: Deploying Predictive Service to Heroku${NC}"
echo "=============================="
echo ""

read -p "Deploy Predictive Service to Heroku? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}Deploying Predictive Service...${NC}"
    
    if git remote | grep -q "heroku-predictive"; then
        git subtree push --prefix project/predictive-service heroku-predictive main
    else
        echo -e "${YELLOW}⚠️  Heroku remote 'heroku-predictive' not found${NC}"
        echo "Creating Heroku app..."
        read -p "Enter Heroku app name for Predictive Service (or press Enter for default): " PREDICTIVE_APP
        if [ -z "$PREDICTIVE_APP" ]; then
            PREDICTIVE_APP="double-v-predictive"
        fi
        
        heroku git:remote -a "$PREDICTIVE_APP" -r heroku-predictive 2>/dev/null || \
        heroku create "$PREDICTIVE_APP" -r heroku-predictive
        
        git subtree push --prefix project/predictive-service heroku-predictive main
    fi
    
    echo -e "${GREEN}✅ Predictive Service deployed to Heroku${NC}"
else
    echo -e "${YELLOW}⚠️  Skipped Predictive Service deployment${NC}"
fi
echo ""

# Step 5: Deploy to Vercel
echo -e "${BLUE}Step 5: Deploying Frontend to Vercel${NC}"
echo "=============================="
echo ""

read -p "Deploy Frontend to Vercel? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd project/frontend
    
    if command -v vercel &> /dev/null; then
        echo -e "${BLUE}Deploying to Vercel...${NC}"
        vercel --prod
        echo -e "${GREEN}✅ Frontend deployed to Vercel${NC}"
    else
        echo -e "${YELLOW}⚠️  Vercel CLI not installed${NC}"
        echo "Install it with: npm i -g vercel"
        echo ""
        echo "Or deploy via:"
        echo "1. Connect GitHub repo to Vercel dashboard"
        echo "2. Vercel will auto-deploy on push to main"
    fi
    
    cd "$PROJECT_ROOT"
else
    echo -e "${YELLOW}⚠️  Skipped Vercel deployment${NC}"
fi
echo ""

# Summary
echo "=============================="
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo "=============================="
echo ""
echo "Next steps:"
echo "1. ✅ Check Heroku apps are running"
echo "2. ✅ Verify environment variables are set"
echo "3. ✅ Test deployed services"
echo ""
echo "Heroku apps:"
echo "  - Strapi: https://double-v-strapi-dd98523889e0.herokuapp.com"
echo "  - Predictive: https://double-v-predictive-10a3079347ff.herokuapp.com"
echo ""
echo "Vercel:"
echo "  - Frontend: Check your Vercel dashboard"

