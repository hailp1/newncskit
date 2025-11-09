#!/bin/bash

# Test Upload API Script
# This script tests the analysis API endpoints

BASE_URL="https://app.ncskit.org"
# For local testing, use: BASE_URL="http://localhost:3000"

echo -e "\033[36mTesting Analysis API Endpoints...\033[0m"
echo ""

# Test 1: Test endpoint
echo -e "\033[33m1. Testing /api/analysis/test endpoint...\033[0m"
response=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/analysis/test")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ]; then
    echo -e "\033[32m✓ Test endpoint working!\033[0m"
    echo -e "\033[90mResponse: $body\033[0m"
else
    echo -e "\033[31m✗ Test endpoint failed! (HTTP $http_code)\033[0m"
fi

echo ""

# Test 2: Upload endpoint with GET (should fail gracefully)
echo -e "\033[33m2. Testing /api/analysis/upload with GET (should return error)...\033[0m"
response=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/analysis/upload")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "405" ]; then
    echo -e "\033[32m✓ Upload endpoint correctly rejects GET requests (405)!\033[0m"
    echo -e "\033[90mResponse: $body\033[0m"
else
    echo -e "\033[31m✗ Unexpected response! (HTTP $http_code)\033[0m"
fi

echo ""

# Test 3: Health endpoint
echo -e "\033[33m3. Testing /api/analysis/health endpoint...\033[0m"
response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/analysis/health" \
    -H "Content-Type: application/json" \
    -d '{"projectId":"test-project-123"}')
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ]; then
    echo -e "\033[32m✓ Health endpoint working!\033[0m"
    echo -e "\033[90mResponse: $body\033[0m"
else
    echo -e "\033[31m✗ Health endpoint failed! (HTTP $http_code)\033[0m"
fi

echo ""
echo -e "\033[36mAPI Testing Complete!\033[0m"
echo ""
echo -e "\033[33mNext steps:\033[0m"
echo "1. If all tests pass, try uploading a CSV file at $BASE_URL/analysis/new"
echo "2. Check browser console for detailed logs"
echo "3. If issues persist, check Vercel logs: vercel logs --follow"
