#!/bin/bash

# Script to check if environment variables are properly loaded across all services

set -e

echo "🔍 Checking Environment Variables"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Function to check env file
check_env_file() {
    local service_dir=$1
    local service_name=$2
    local expected_file=$3
    
    echo -e "${BLUE}📁 Checking $service_name...${NC}"
    cd "$service_dir"
    
    if [ -f "$expected_file" ]; then
        echo -e "${GREEN}  ✅ $expected_file exists${NC}"
        
        # Check if file has content (not just template values)
        if grep -q "your-.*-here\|localhost\|example" "$expected_file" 2>/dev/null; then
            echo -e "${YELLOW}  ⚠️  $expected_file may contain template values (check for 'your-*-here')${NC}"
        fi
        
        # Count variables
        var_count=$(grep -v '^#' "$expected_file" | grep -v '^$' | wc -l | tr -d ' ')
        echo -e "  📊 Found $var_count environment variables"
        
    else
        echo -e "${RED}  ❌ $expected_file not found${NC}"
        if [ -f "env.example" ]; then
            echo -e "${YELLOW}     💡 Run: cp env.example $expected_file${NC}"
        fi
    fi
    
    cd "$PROJECT_ROOT"
    echo ""
}

# Check all services
check_env_file "project/frontend" "Frontend" ".env.local"
check_env_file "project/api-server" "API Server" ".env.local"
check_env_file "project/strapi" "Strapi" ".env.local"
check_env_file "project/predictive-service" "Predictive Service" ".env.local"

# Check Node.js services can load vars
echo "Testing Node.js environment variable loading..."
echo ""

if command -v node &> /dev/null; then
    echo -e "${BLUE}Testing API Server...${NC}"
    cd "$PROJECT_ROOT/project/api-server"
    if [ -f ".env.local" ]; then
        PORT=$(node -e "require('dotenv').config({ path: '.env.local' }); console.log(process.env.PORT || 'NOT SET')")
        STRAPI_URL=$(node -e "require('dotenv').config({ path: '.env.local' }); console.log(process.env.STRAPI_URL || 'NOT SET')")
        echo -e "  PORT: ${GREEN}$PORT${NC}"
        echo -e "  STRAPI_URL: ${GREEN}$STRAPI_URL${NC}"
    else
        echo -e "${RED}  ⚠️  .env.local not found${NC}"
    fi
    echo ""
fi

# Check Python service
echo "Testing Python environment variable loading..."
echo ""

if command -v python3 &> /dev/null; then
    echo -e "${BLUE}Testing Predictive Service...${NC}"
    cd "$PROJECT_ROOT/project/predictive-service"
    if [ -f ".env.local" ]; then
        PORT=$(python3 -c "from dotenv import load_dotenv; import os; load_dotenv('.env.local'); print(os.getenv('PORT', 'NOT SET'))")
        STRAPI_URL=$(python3 -c "from dotenv import load_dotenv; import os; load_dotenv('.env.local'); print(os.getenv('STRAPI_URL', 'NOT SET'))")
        echo -e "  PORT: ${GREEN}$PORT${NC}"
        echo -e "  STRAPI_URL: ${GREEN}$STRAPI_URL${NC}"
    else
        echo -e "${RED}  ⚠️  .env.local not found${NC}"
    fi
    echo ""
fi

cd "$PROJECT_ROOT"

echo "================================================"
echo -e "${GREEN}✅ Environment variable check complete!${NC}"
echo ""
echo -e "${BLUE}📝 Tips:${NC}"
echo "  - All services should use .env.local for local development"
echo "  - .env.local files are git-ignored (safe for secrets)"
echo "  - See ENV_SETUP_GUIDE.md for detailed documentation"



