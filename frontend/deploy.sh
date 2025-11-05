#!/bin/bash

# NCSKIT Vercel Deployment Script

echo "🚀 Starting NCSKIT deployment to Vercel..."

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the frontend directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Type check
echo "🔍 Running type check..."
npm run type-check

# Lint check
echo "🧹 Running lint check..."
npm run lint

# Build test
echo "🏗️ Testing build..."
npm run build

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
npx vercel --prod

echo "✅ Deployment completed!"
echo "🎉 NCSKIT is now live on Vercel!"