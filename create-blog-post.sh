#!/bin/bash

# Script to create NCSKit introduction blog post

echo "🚀 Creating NCSKit introduction blog post..."

# Navigate to backend directory
cd backend

# Activate virtual environment if exists
if [ -f "venv/bin/activate" ]; then
    echo "📦 Activating virtual environment..."
    source venv/bin/activate
fi

# Run the management command
echo "✍️ Creating blog post..."
python manage.py create_ncskit_intro_post

echo ""
echo "✅ Blog post created successfully!"
echo "📝 You can view it at: https://app.ncskit.org/blog"
echo ""
echo "💡 To create more sample posts, run:"
echo "   python manage.py create_sample_blog_posts"

# Return to root directory
cd ..
