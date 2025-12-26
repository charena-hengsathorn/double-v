#!/bin/bash

# Script to set up .env.local files for all services from env.example templates

set -e

echo "🔧 Setting up .env.local files for all services"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Function to setup env file
setup_env_file() {
    local service_dir=$1
    local service_name=$2
    
    if [ ! -d "$service_dir" ]; then
        echo -e "${YELLOW}⚠️  Directory $service_dir not found, skipping...${NC}"
        return
    fi
    
    echo -e "${BLUE}📁 Setting up $service_name...${NC}"
    cd "$service_dir"
    
    if [ -f "env.example" ]; then
        if [ -f ".env.local" ]; then
            echo -e "${YELLOW}  ⚠️  .env.local already exists, backing up to .env.local.backup${NC}"
            cp .env.local .env.local.backup 2>/dev/null || true
        fi
        
        if [ ! -f ".env.local" ]; then
            cp env.example .env.local
            echo -e "${GREEN}  ✅ Created .env.local from env.example${NC}"
        else
            echo -e "${YELLOW}  ⏭️  .env.local already exists, skipping${NC}"
        fi
    else
        echo -e "${RED}  ❌ env.example not found${NC}"
    fi
    
    cd "$PROJECT_ROOT"
    echo ""
}

# Setup all services
echo "Setting up environment files..."
echo ""

setup_env_file "project/frontend" "Frontend"
setup_env_file "project/api-server" "API Server"
setup_env_file "project/strapi" "Strapi"
setup_env_file "project/predictive-service" "Predictive Service"

echo "================================================"
echo -e "${GREEN}✅ Environment setup complete!${NC}"
echo ""
echo -e "${BLUE}📝 Next steps:${NC}"
echo "  1. Edit each .env.local file with your actual values"
echo "  2. Generate secrets for Strapi (use: openssl rand -base64 32)"
echo "  3. Update database URLs if needed"
echo "  4. Update service URLs if running on different ports"
echo ""
echo -e "${YELLOW}⚠️  Remember: .env.local files are git-ignored and contain sensitive data${NC}"


