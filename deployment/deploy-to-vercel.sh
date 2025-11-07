#!/bin/bash

# Deploy to Vercel Script
# Automates the deployment process to Vercel

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;37m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Default values
PRODUCTION=false
PREVIEW=false
SKIP_BUILD=false
SKIP_TESTS=false
MESSAGE=""

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --production)
            PRODUCTION=true
            shift
            ;;
        --preview)
            PREVIEW=true
            shift
            ;;
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --message)
            MESSAGE="$2"
            shift 2
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  NCSKIT Vercel Deployment${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# Determine deployment type
if [ "$PRODUCTION" = true ]; then
    DEPLOYMENT_TYPE="Production"
else
    DEPLOYMENT_TYPE="Preview"
fi

echo -e "${CYAN}Deployment Type: $DEPLOYMENT_TYPE${NC}"
echo ""

# Check if we're in the correct directory
if [ ! -f "frontend/package.json" ]; then
    echo -e "${RED}❌ Error: Must run from project root directory${NC}"
    exit 1
fi

# Step 1: Check Git status
echo -e "${YELLOW}Step 1: Checking Git status...${NC}"

GIT_STATUS=$(git status --porcelain 2>/dev/null || echo "")

if [ -n "$GIT_STATUS" ] && [ "$PREVIEW" = false ]; then
    echo -e "${YELLOW}⚠️  You have uncommitted changes:${NC}"
    git status --short
    echo ""
    
    read -p "Do you want to commit these changes? (y/N): " response
    
    if [[ "$response" =~ ^[Yy]$ ]]; then
        if [ -z "$MESSAGE" ]; then
            read -p "Enter commit message: " MESSAGE
        fi
        
        echo -e "${CYAN}   Staging all changes...${NC}"
        git add .
        
        echo -e "${CYAN}   Committing changes...${NC}"
        git commit -m "$MESSAGE"
        
        echo -e "${GREEN}✅ Changes committed${NC}"
    else
        echo -e "${YELLOW}⚠️  Proceeding with uncommitted changes${NC}"
    fi
else
    echo -e "${GREEN}✅ Working directory is clean${NC}"
fi

echo ""

# Step 2: Run tests (unless skipped)
if [ "$SKIP_TESTS" = false ]; then
    echo -e "${YELLOW}Step 2: Running tests...${NC}"
    
    cd frontend
    
    echo -e "${CYAN}   Running type check...${NC}"
    npm run type-check
    
    echo -e "${CYAN}   Running tests...${NC}"
    npm run test
    
    echo -e "${GREEN}✅ All tests passed${NC}"
    
    cd ..
else
    echo -e "${YELLOW}Step 2: Skipping tests (--skip-tests flag)${NC}"
fi

echo ""

# Step 3: Build locally (unless skipped)
if [ "$SKIP_BUILD" = false ]; then
    echo -e "${YELLOW}Step 3: Building locally...${NC}"
    
    cd frontend
    
    echo -e "${CYAN}   Running build...${NC}"
    npm run build
    
    echo -e "${GREEN}✅ Build successful${NC}"
    
    cd ..
else
    echo -e "${YELLOW}Step 3: Skipping local build (--skip-build flag)${NC}"
fi

echo ""

# Step 4: Push to Git (for production)
if [ "$PRODUCTION" = true ]; then
    echo -e "${YELLOW}Step 4: Pushing to Git repository...${NC}"
    
    CURRENT_BRANCH=$(git branch --show-current)
    echo -e "${CYAN}   Current branch: $CURRENT_BRANCH${NC}"
    
    if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
        echo -e "${YELLOW}⚠️  You are not on main/master branch${NC}"
        read -p "Do you want to continue? (y/N): " response
        
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            echo -e "${YELLOW}Deployment cancelled${NC}"
            exit 0
        fi
    fi
    
    echo -e "${CYAN}   Pushing to remote...${NC}"
    git push origin "$CURRENT_BRANCH"
    
    echo -e "${GREEN}✅ Pushed to Git successfully${NC}"
else
    echo -e "${YELLOW}Step 4: Skipping Git push (preview deployment)${NC}"
fi

echo ""

# Step 5: Deploy to Vercel
echo -e "${YELLOW}Step 5: Deploying to Vercel...${NC}"

cd frontend

if [ "$PRODUCTION" = true ]; then
    echo -e "${CYAN}   Deploying to production...${NC}"
    echo -e "${YELLOW}   This will update your live site!${NC}"
    echo ""
    
    read -p "Are you sure you want to deploy to production? (y/N): " response
    
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Deployment cancelled${NC}"
        cd ..
        exit 0
    fi
    
    vercel --prod
else
    echo -e "${CYAN}   Deploying to preview...${NC}"
    vercel
fi

echo -e "${GREEN}✅ Deployment successful${NC}"

cd ..

echo ""

# Step 6: Get deployment URL
echo -e "${YELLOW}Step 6: Getting deployment URL...${NC}"

cd frontend

DEPLOYMENT_URL=$(vercel ls --json 2>/dev/null | jq -r '.[0].url' 2>/dev/null || echo "")

if [ -n "$DEPLOYMENT_URL" ]; then
    FULL_URL="https://$DEPLOYMENT_URL"
    echo -e "${GREEN}✅ Deployment URL: $FULL_URL${NC}"
    
    # Copy to clipboard (if xclip is available on Linux)
    if command -v xclip &> /dev/null; then
        echo "$FULL_URL" | xclip -selection clipboard
        echo -e "${CYAN}   URL copied to clipboard${NC}"
    elif command -v pbcopy &> /dev/null; then
        # macOS
        echo "$FULL_URL" | pbcopy
        echo -e "${CYAN}   URL copied to clipboard${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Could not retrieve deployment URL${NC}"
    echo -e "${CYAN}   Check Vercel dashboard: https://vercel.com/dashboard${NC}"
fi

cd ..

echo ""

# Step 7: Summary
echo -e "${CYAN}========================================${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""
echo -e "${WHITE}Deployment Type: $DEPLOYMENT_TYPE${NC}"
if [ -n "$DEPLOYMENT_URL" ]; then
    echo -e "${WHITE}Deployment URL: $FULL_URL${NC}"
fi
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Open deployment URL to verify"
echo "  2. Check deployment logs: vercel logs <url>"
echo "  3. Monitor health checks: <url>/api/health"
if [ "$PRODUCTION" = false ]; then
    echo "  4. If preview looks good, deploy to production:"
    echo -e "${GRAY}     ./deployment/deploy-to-vercel.sh --production${NC}"
fi
echo ""
echo -e "${CYAN}Useful Commands:${NC}"
echo -e "${GRAY}  vercel logs <url>  - View deployment logs${NC}"
echo -e "${GRAY}  vercel ls          - List all deployments${NC}"
echo -e "${GRAY}  vercel inspect     - Inspect deployment details${NC}"
echo -e "${GRAY}  vercel rollback    - Rollback to previous deployment${NC}"
echo ""
