#!/bin/bash

# Script to push environment variables to Heroku and Vercel
# This sets PRODUCTION values, not localhost values

set -e

echo "🚀 Pushing Environment Variables to Production"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Heroku Strapi App
echo "📦 Setting Heroku Strapi variables..."
echo -e "${YELLOW}Note: Some variables are already set. This will update/add missing ones.${NC}"
echo ""

# Strapi - Production URLs
heroku config:set -a double-v-strapi \
  STRAPI_URL=https://double-v-strapi-dd98523889e0.herokuapp.com \
  FRONTEND_URL=https://double-v-frontend.vercel.app \
  PREDICTIVE_SERVICE_URL=https://double-v-predictive-10a3079347ff.herokuapp.com \
  2>&1 | grep -v "Setting\|done\|Restarting" || true

echo -e "${GREEN}✅ Strapi environment variables updated${NC}"
echo ""

# Heroku Predictive Service
echo "📦 Setting Heroku Predictive Service variables..."
echo ""

# Predictive Service - Production values
heroku config:set -a double-v-predictive \
  STRAPI_URL=https://double-v-strapi-dd98523889e0.herokuapp.com/api \
  CORS_ORIGINS=https://double-v-frontend.vercel.app,http://localhost:3000 \
  ENVIRONMENT=production \
  LOG_LEVEL=INFO \
  MODEL_VERSION=1.0.0 \
  MONTE_CARLO_ITERATIONS=10000 \
  FORECAST_HORIZON_MONTHS=12 \
  2>&1 | grep -v "Setting\|done\|Restarting" || true

echo -e "${GREEN}✅ Predictive Service environment variables updated${NC}"
echo ""

# Vercel Frontend
echo "📦 Setting Vercel Frontend variables..."
echo ""

cd project/frontend

# Vercel - Production URLs
echo "Adding production environment variables to Vercel..."
echo ""

# Note: vercel env add requires interactive input, so we'll use a different approach
echo -e "${YELLOW}For Vercel, you'll need to add these manually or use:${NC}"
echo "  vercel env add NEXT_PUBLIC_STRAPI_URL production"
echo "  vercel env add NEXT_PUBLIC_PREDICTIVE_SERVICE_URL production"
echo "  vercel env add NEXT_PUBLIC_APP_URL production"
echo ""

echo "Or use Vercel dashboard: https://vercel.com/charenas-projects/frontend/settings/environment-variables"
echo ""

echo "=============================================="
echo -e "${GREEN}✅ Heroku environment variables updated!${NC}"
echo -e "${YELLOW}⚠️  Vercel variables need to be added manually (see above)${NC}"
echo ""

