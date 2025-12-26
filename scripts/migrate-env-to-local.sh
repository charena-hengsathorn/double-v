#!/bin/bash

# Script to migrate existing .env files to .env.local (standardized naming)

set -e

echo "🔄 Migrating .env files to .env.local"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Function to migrate env file
migrate_env_file() {
    local service_dir=$1
    local service_name=$2
    
    if [ ! -d "$service_dir" ]; then
        return
    fi
    
    cd "$service_dir"
    
    if [ -f ".env" ] && [ ! -f ".env.local" ]; then
        echo -e "${BLUE}📁 Migrating $service_name...${NC}"
        cp .env .env.local
        echo -e "${GREEN}  ✅ Migrated .env to .env.local${NC}"
        echo -e "${YELLOW}  💡 You can now delete .env (keeping .env.local)${NC}"
    elif [ -f ".env" ] && [ -f ".env.local" ]; then
        echo -e "${YELLOW}📁 $service_name: Both .env and .env.local exist${NC}"
        echo -e "${YELLOW}  ⚠️  Keeping both files. .env.local takes priority.${NC}"
    elif [ ! -f ".env" ] && [ ! -f ".env.local" ]; then
        echo -e "${BLUE}📁 $service_name: No .env files found${NC}"
        if [ -f "env.example" ]; then
            echo -e "${YELLOW}  💡 Run: cp env.example .env.local${NC}"
        fi
    elif [ ! -f ".env" ] && [ -f ".env.local" ]; then
        echo -e "${GREEN}📁 $service_name: Already using .env.local ✅${NC}"
    fi
    
    cd "$PROJECT_ROOT"
    echo ""
}

# Migrate all services
migrate_env_file "project/api-server" "API Server"
migrate_env_file "project/strapi" "Strapi"

echo "======================================"
echo -e "${GREEN}✅ Migration check complete!${NC}"
echo ""
echo -e "${BLUE}📝 Note:${NC}"
echo "  - Services now prioritize .env.local over .env"
echo "  - You can safely delete old .env files if .env.local exists"
echo "  - .env.local files are git-ignored"


