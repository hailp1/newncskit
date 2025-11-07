#!/bin/bash

# Vercel Project Setup Script
# This script automates the Vercel project setup process

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

# Default values
SKIP_INSTALL=false
SKIP_LINK=false
PROJECT_NAME="ncskit"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-install)
            SKIP_INSTALL=true
            shift
            ;;
        --skip-link)
            SKIP_LINK=true
            shift
            ;;
        --project-name)
            PROJECT_NAME="$2"
            shift 2
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  NCSKIT Vercel Setup Script${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# Check if we're in the correct directory
if [ ! -f "frontend/package.json" ]; then
    echo -e "${RED}❌ Error: Must run from project root directory${NC}"
    echo -e "${YELLOW}   Current directory: $(pwd)${NC}"
    exit 1
fi

# Step 1: Check Vercel CLI installation
echo -e "${YELLOW}Step 1: Checking Vercel CLI...${NC}"
if ! command -v vercel &> /dev/null; then
    if [ "$SKIP_INSTALL" = true ]; then
        echo -e "${RED}❌ Vercel CLI not found. Please install: npm i -g vercel${NC}"
        exit 1
    fi
    
    echo -e "${CYAN}📦 Installing Vercel CLI globally...${NC}"
    npm i -g vercel
    
    echo -e "${GREEN}✅ Vercel CLI installed successfully${NC}"
else
    echo -e "${GREEN}✅ Vercel CLI is already installed${NC}"
fi

echo ""

# Step 2: Login to Vercel
echo -e "${YELLOW}Step 2: Vercel Authentication...${NC}"
echo -e "${CYAN}   Please login to your Vercel account in the browser${NC}"

vercel login

echo -e "${GREEN}✅ Successfully authenticated with Vercel${NC}"
echo ""

# Step 3: Link project
if [ "$SKIP_LINK" = false ]; then
    echo -e "${YELLOW}Step 3: Linking project to Vercel...${NC}"
    
    cd frontend
    
    # Check if already linked
    if [ -d ".vercel" ]; then
        echo -e "${YELLOW}⚠️  Project is already linked to Vercel${NC}"
        read -p "Do you want to re-link? (y/N): " response
        
        if [[ "$response" =~ ^[Yy]$ ]]; then
            rm -rf .vercel
            echo -e "${CYAN}   Removed existing link${NC}"
        else
            echo -e "${CYAN}   Keeping existing link${NC}"
            cd ..
            echo ""
            echo -e "${GREEN}✅ Project setup complete!${NC}"
            exit 0
        fi
    fi
    
    echo -e "${CYAN}   Follow the prompts to link your project:${NC}"
    echo -e "${GRAY}   - Select your Vercel scope${NC}"
    echo -e "${GRAY}   - Link to existing project or create new${NC}"
    echo -e "${GRAY}   - Confirm project settings${NC}"
    echo ""
    
    vercel link
    
    echo -e "${GREEN}✅ Project linked successfully${NC}"
    cd ..
else
    echo -e "${YELLOW}Step 3: Skipping project link (--skip-link flag)${NC}"
fi

echo ""

# Step 4: Environment Variables Setup
echo -e "${YELLOW}Step 4: Environment Variables Configuration${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: You need to configure environment variables in Vercel Dashboard${NC}"
echo ""
echo -e "${CYAN}Required environment variables:${NC}"
echo -e "  1. NEXT_PUBLIC_SUPABASE_URL"
echo -e "  2. NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo -e "  3. SUPABASE_SERVICE_ROLE_KEY (⚠️  SENSITIVE)"
echo -e "  4. NEXT_PUBLIC_ANALYTICS_URL"
echo -e "  5. ANALYTICS_API_KEY (⚠️  SENSITIVE)"
echo -e "  6. NEXT_PUBLIC_APP_URL"
echo ""

read -p "Do you want to add environment variables now via CLI? (y/N): " response

if [[ "$response" =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${CYAN}Adding environment variables...${NC}"
    echo -e "${GRAY}Note: You'll be prompted for each variable value${NC}"
    echo ""
    
    cd frontend
    
    # Supabase URL
    echo -e "${CYAN}1/6: NEXT_PUBLIC_SUPABASE_URL${NC}"
    vercel env add NEXT_PUBLIC_SUPABASE_URL production preview development
    
    # Supabase Anon Key
    echo -e "${CYAN}2/6: NEXT_PUBLIC_SUPABASE_ANON_KEY${NC}"
    vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production preview development
    
    # Supabase Service Role Key
    echo -e "${CYAN}3/6: SUPABASE_SERVICE_ROLE_KEY (⚠️  SENSITIVE)${NC}"
    vercel env add SUPABASE_SERVICE_ROLE_KEY production preview development
    
    # Analytics URL
    echo -e "${CYAN}4/6: NEXT_PUBLIC_ANALYTICS_URL${NC}"
    echo -e "${GRAY}   Production: https://analytics.ncskit.app${NC}"
    echo -e "${GRAY}   Preview/Dev: http://localhost:8000${NC}"
    vercel env add NEXT_PUBLIC_ANALYTICS_URL production preview development
    
    # Analytics API Key
    echo -e "${CYAN}5/6: ANALYTICS_API_KEY (⚠️  SENSITIVE)${NC}"
    echo -e "${GRAY}   Generate with: openssl rand -base64 32${NC}"
    vercel env add ANALYTICS_API_KEY production preview development
    
    # App URL
    echo -e "${CYAN}6/6: NEXT_PUBLIC_APP_URL${NC}"
    echo -e "${GRAY}   Production: https://${PROJECT_NAME}.vercel.app${NC}"
    echo -e "${GRAY}   Preview/Dev: http://localhost:3000${NC}"
    vercel env add NEXT_PUBLIC_APP_URL production preview development
    
    cd ..
    
    echo ""
    echo -e "${GREEN}✅ Environment variables added${NC}"
else
    echo ""
    echo -e "${YELLOW}⚠️  Remember to add environment variables manually:${NC}"
    echo -e "${CYAN}   1. Go to https://vercel.com/dashboard${NC}"
    echo -e "${CYAN}   2. Select your project${NC}"
    echo -e "${CYAN}   3. Navigate to Settings → Environment Variables${NC}"
    echo -e "${CYAN}   4. Add all required variables${NC}"
    echo ""
    echo -e "${GRAY}   See deployment/vercel-setup.md for detailed instructions${NC}"
fi

echo ""

# Step 5: Verify Configuration
echo -e "${YELLOW}Step 5: Verifying Configuration...${NC}"

cd frontend

# Check if .vercel directory exists
if [ -d ".vercel" ]; then
    echo -e "${GREEN}✅ Project is linked to Vercel${NC}"
else
    echo -e "${YELLOW}⚠️  Project link not found (.vercel directory missing)${NC}"
fi

# List environment variables
echo ""
echo -e "${CYAN}Current environment variables:${NC}"
vercel env ls 2>/dev/null || true

cd ..

echo ""

# Step 6: Summary and Next Steps
echo -e "${CYAN}========================================${NC}"
echo -e "${GREEN}  Setup Complete!${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""
echo -e "${GREEN}✅ Vercel CLI installed and authenticated${NC}"
echo -e "${GREEN}✅ Project linked to Vercel${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo -e "  1. Verify environment variables in Vercel Dashboard"
echo -e "  2. Configure deployment settings (if needed)"
echo -e "  3. Test preview deployment: cd frontend && vercel"
echo -e "  4. Deploy to production: cd frontend && vercel --prod"
echo ""
echo -e "${CYAN}Documentation:${NC}"
echo -e "${GRAY}  - Setup Guide: deployment/vercel-setup.md${NC}"
echo -e "${GRAY}  - Vercel Dashboard: https://vercel.com/dashboard${NC}"
echo ""
echo -e "${CYAN}Useful Commands:${NC}"
echo -e "${GRAY}  vercel          - Deploy to preview${NC}"
echo -e "${GRAY}  vercel --prod   - Deploy to production${NC}"
echo -e "${GRAY}  vercel logs     - View deployment logs${NC}"
echo -e "${GRAY}  vercel ls       - List deployments${NC}"
echo -e "${GRAY}  vercel env ls   - List environment variables${NC}"
echo ""
