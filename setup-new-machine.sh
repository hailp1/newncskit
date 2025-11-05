#!/bin/bash

echo "🚀 Setting up NCSKit on new machine..."
echo "======================================"

# Check if required tools are installed
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ $1 is not installed. Please install it first."
        exit 1
    else
        echo "✅ $1 is available"
    fi
}

echo "Checking required tools..."
check_command node
check_command python3
check_command docker
check_command docker-compose
check_command git

# Get Node.js and Python versions
NODE_VERSION=$(node --version)
PYTHON_VERSION=$(python3 --version)
echo "📋 Node.js version: $NODE_VERSION"
echo "📋 Python version: $PYTHON_VERSION"

# Install frontend dependencies
echo ""
echo "📦 Installing frontend dependencies..."
cd frontend
if [ -f "package-lock.json" ]; then
    npm ci
else
    npm install
fi
cd ..

# Setup Python virtual environment
echo ""
echo "🐍 Setting up Python environment..."
cd backend
python3 -m venv venv

# Activate virtual environment (Linux/Mac)
if [[ "$OSTYPE" == "linux-gnu"* ]] || [[ "$OSTYPE" == "darwin"* ]]; then
    source venv/bin/activate
    echo "✅ Virtual environment activated (Linux/Mac)"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
    echo "✅ Virtual environment activated (Windows)"
fi

pip install --upgrade pip
pip install -r requirements.txt
cd ..

# Setup database with Docker
echo ""
echo "🐘 Setting up PostgreSQL database..."
docker-compose up -d postgres
echo "⏳ Waiting for database to be ready..."
sleep 15

# Test database connection
echo "🔍 Testing database connection..."
if node test-database-connection.js; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed. Please check Docker and try again."
    exit 1
fi

# Setup database schema
echo ""
echo "🗄️ Setting up database schema..."
node setup-local-database.js

# Run Django migrations
echo ""
echo "🔄 Running Django migrations..."
cd backend
if [[ "$OSTYPE" == "linux-gnu"* ]] || [[ "$OSTYPE" == "darwin"* ]]; then
    source venv/bin/activate
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
fi

python manage.py makemigrations
python manage.py migrate
python manage.py collectstatic --noinput
cd ..

# Setup R environment
echo ""
echo "📊 Setting up R environment..."
if command -v R &> /dev/null; then
    echo "✅ R is available"
    cd backend/r_analysis
    R -e "source('setup.R')"
    cd ../..
else
    echo "⚠️ R is not installed. R analysis features will not work."
fi

echo ""
echo "🎉 Setup completed successfully!"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Start the database: docker-compose up -d"
echo "2. Start the backend:"
echo "   cd backend"
if [[ "$OSTYPE" == "linux-gnu"* ]] || [[ "$OSTYPE" == "darwin"* ]]; then
    echo "   source venv/bin/activate"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    echo "   venv\\Scripts\\activate"
fi
echo "   python manage.py runserver"
echo ""
echo "3. Start the frontend (in another terminal):"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "4. Start R server (optional, in another terminal):"
echo "   node start-r-server.js"
echo ""
echo "🌐 Access the application at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   Admin Panel: http://localhost:8000/admin"
echo ""
echo "📚 Check the documentation in the docs/ folder for more information."