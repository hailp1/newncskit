#!/bin/bash

# Test script for R Analytics API endpoints
# Run this after starting the Docker container

BASE_URL="http://localhost:8000"

echo -e "\033[36mTesting R Analytics API Endpoints...\033[0m"
echo ""

# Test 1: Health Check
echo -e "\033[33m1. Testing Health Check Endpoint...\033[0m"
response=$(curl -s "$BASE_URL/health")
if [ $? -eq 0 ]; then
    echo -e "\033[32m✓ Health check passed\033[0m"
    echo "$response" | jq '.'
    echo ""
else
    echo -e "\033[31m✗ Health check failed\033[0m"
    echo ""
fi

# Test 2: Sentiment Analysis
echo -e "\033[33m2. Testing Sentiment Analysis Endpoint...\033[0m"
response=$(curl -s -X POST "$BASE_URL/analyze/sentiment" \
    -H "Content-Type: application/json" \
    -d '{"text": "This is an amazing product! I love it so much. It works perfectly and exceeded my expectations."}')

if [ $? -eq 0 ]; then
    success=$(echo "$response" | jq -r '.success')
    if [ "$success" = "true" ]; then
        echo -e "\033[32m✓ Sentiment analysis passed\033[0m"
        echo "$response" | jq '.data'
    else
        echo -e "\033[31m✗ Sentiment analysis failed\033[0m"
        echo "$response" | jq '.'
    fi
    echo ""
else
    echo -e "\033[31m✗ Sentiment analysis failed\033[0m"
    echo ""
fi

# Test 3: Text Clustering
echo -e "\033[33m3. Testing Text Clustering Endpoint...\033[0m"
response=$(curl -s -X POST "$BASE_URL/analyze/cluster" \
    -H "Content-Type: application/json" \
    -d '{
        "texts": [
            "The weather is sunny and warm today",
            "I love programming in R and Python",
            "Machine learning is fascinating",
            "It'\''s raining heavily outside",
            "Data science is my passion",
            "The temperature dropped significantly"
        ],
        "n_clusters": 2
    }')

if [ $? -eq 0 ]; then
    success=$(echo "$response" | jq -r '.success')
    if [ "$success" = "true" ]; then
        echo -e "\033[32m✓ Text clustering passed\033[0m"
        echo "$response" | jq '.data | {nClusters, silhouetteScore, processingTime}'
    else
        echo -e "\033[31m✗ Text clustering failed\033[0m"
        echo "$response" | jq '.'
    fi
    echo ""
else
    echo -e "\033[31m✗ Text clustering failed\033[0m"
    echo ""
fi

# Test 4: Topic Modeling
echo -e "\033[33m4. Testing Topic Modeling Endpoint...\033[0m"
response=$(curl -s -X POST "$BASE_URL/analyze/topics" \
    -H "Content-Type: application/json" \
    -d '{
        "texts": [
            "Machine learning algorithms are used for prediction",
            "Deep learning neural networks process images",
            "Natural language processing analyzes text data",
            "Computer vision recognizes objects in photos",
            "Reinforcement learning trains agents through rewards",
            "Data preprocessing cleans and transforms datasets"
        ],
        "n_topics": 2
    }')

if [ $? -eq 0 ]; then
    success=$(echo "$response" | jq -r '.success')
    if [ "$success" = "true" ]; then
        echo -e "\033[32m✓ Topic modeling passed\033[0m"
        echo "$response" | jq '.data | {nTopics, processingTime}'
    else
        echo -e "\033[31m✗ Topic modeling failed\033[0m"
        echo "$response" | jq '.'
    fi
    echo ""
else
    echo -e "\033[31m✗ Topic modeling failed\033[0m"
    echo ""
fi

echo -e "\033[36mTesting completed!\033[0m"
