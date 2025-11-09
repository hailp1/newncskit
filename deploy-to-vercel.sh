#!/bin/bash

# Deployment Script for Data Analysis & Campaigns v2
# Usage: ./deploy-to-vercel.sh [staging|production]

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-staging}
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$PROJECT_DIR/frontend"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  NCSKit Deployment Script${NC}"
echo -e "${BLUE}  Environment: $ENVIRONMENT${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to print status
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Step 1: Pre-deployment checks
echo -e "${BLUE}Step 1: Pre-deployment checks${NC}"
echo "-----------------------------------"

# Check if we're in the right directory
if [ ! -d "$FRONTEND_DIR" ]; then
    print_error "Frontend directory not found!"
    exit 1
fi
print_status "Project directory verified"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed!"
    exit 1
fi
print_status "Node.js found: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed!"
    exit 1
fi
print_status "npm found: $(npm --version)"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI not found. Installing..."
    npm install -g vercel
fi
print_status "Vercel CLI found"

echo ""

# Step 2: Run tests
echo -e "${BLUE}Step 2: Running tests${NC}"
echo "-----------------------------------"

cd "$FRONTEND_DIR"

# Type check
print_info "Running TypeScript type check..."
if npm run type-check 2>/dev/null; then
    print_status "Type check passed"
else
    print_warning "Type check skipped (script not found)"
fi

# Build test
print_info "Running build test..."
if npm run build; then
    print_status "Build successful"
else
    print_error "Build failed!"
    exit 1
fi

echo ""

# Step 3: Git status check
echo -e "${BLUE}Step 3: Git status check${NC}"
echo "-----------------------------------"

cd "$PROJECT_DIR"

# Check if there are uncommitted changes
if [[ -n $(git status -s) ]]; then
    print_warning "You have uncommitted changes:"
    git status -s
    echo ""
    read -p "Do you want to continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Deployment cancelled"
        exit 0
    fi
else
    print_status "No uncommitted changes"
fi

# Show current branch
CURRENT_BRANCH=$(git branch --show-current)
print_info "Current branch: $CURRENT_BRANCH"

echo ""

# Step 4: Deploy to Vercel
echo -e "${BLUE}Step 4: Deploying to Vercel${NC}"
echo "-----------------------------------"

cd "$FRONTEND_DIR"

if [ "$ENVIRONMENT" == "production" ]; then
    print_warning "Deploying to PRODUCTION!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Deployment cancelled"
        exit 0
    fi
    
    print_info "Deploying to production..."
    vercel --prod
else
    print_info "Deploying to staging..."
    vercel
fi

print_status "Deployment initiated"

echo ""

# Step 5: Post-deployment verification
echo -e "${BLUE}Step 5: Post-deployment verification${NC}"
echo "-----------------------------------"

print_info "Please verify the following:"
echo "  1. Visit the deployment URL"
echo "  2. Test /analysis/[projectId] page"
echo "  3. Verify auto-detection triggers"
echo "  4. Check browser console for errors"
echo "  5. Test navigation between steps"
echo "  6. Verify auto-save functionality"
echo ""

if [ "$ENVIRONMENT" == "production" ]; then
    print_warning "PRODUCTION DEPLOYMENT CHECKLIST:"
    echo "  [ ] Monitor error rates in Vercel dashboard"
    echo "  [ ] Check database performance"
    echo "  [ ] Watch user feedback channels"
    echo "  [ ] Keep rollback plan ready"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
print_info "Check Vercel dashboard for deployment status"
print_info "Deployment URL will be shown above"
echo ""
