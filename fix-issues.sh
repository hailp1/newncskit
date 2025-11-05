#!/bin/bash

echo "🔧 Khắc phục sự cố NCSKit..."
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install Node.js
install_nodejs() {
    echo "Cài đặt Node.js..."
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        if command_exists brew; then
            brew install node
        else
            echo "Vui lòng cài đặt Homebrew trước: https://brew.sh"
            exit 1
        fi
    fi
}

# Function to install Python
install_python() {
    echo "Cài đặt Python..."
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get update
        sudo apt-get install -y python3 python3-pip python3-venv
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        if command_exists brew; then
            brew install python
        else
            echo "Vui lòng cài đặt Homebrew trước: https://brew.sh"
            exit 1
        fi
    fi
}

# Function to install Docker
install_docker() {
    echo "Cài đặt Docker..."
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
        echo "Vui lòng logout và login lại để sử dụng Docker"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "Vui lòng tải và cài đặt Docker Desktop từ: https://www.docker.com/products/docker-desktop"
        exit 1
    fi
}

# Check Node.js
echo "Kiểm tra Node.js..."
if command_exists node; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js found: $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js không tìm thấy${NC}"
    read -p "Bạn có muốn cài đặt Node.js không? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        install_nodejs
    else
        echo "Vui lòng cài đặt Node.js từ: https://nodejs.org"
        exit 1
    fi
fi

# Check Python
echo "Kiểm tra Python..."
if command_exists python3; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✅ Python found: $PYTHON_VERSION${NC}"
elif command_exists python; then
    PYTHON_VERSION=$(python --version)
    echo -e "${GREEN}✅ Python found: $PYTHON_VERSION${NC}"
else
    echo -e "${RED}❌ Python không tìm thấy${NC}"
    read -p "Bạn có muốn cài đặt Python không? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        install_python
    else
        echo "Vui lòng cài đặt Python từ: https://python.org"
        exit 1
    fi
fi

# Check Docker
echo "Kiểm tra Docker..."
if command_exists docker; then
    DOCKER_VERSION=$(docker --version)
    echo -e "${GREEN}✅ Docker found: $DOCKER_VERSION${NC}"
else
    echo -e "${RED}❌ Docker không tìm thấy${NC}"
    read -p "Bạn có muốn cài đặt Docker không? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        install_docker
    else
        echo "Vui lòng cài đặt Docker từ: https://docker.com"
        exit 1
    fi
fi

# Clean up old files
echo ""
echo "🧹 Dọn dẹp files cũ..."
if [ -d "frontend/node_modules" ]; then
    echo "Xóa frontend/node_modules..."
    rm -rf frontend/node_modules
fi
if [ -d "frontend/.next" ]; then
    echo "Xóa frontend/.next..."
    rm -rf frontend/.next
fi
if [ -d "backend/venv" ]; then
    echo "Xóa backend/venv..."
    rm -rf backend/venv
fi

# Remove Python cache
echo "Xóa Python cache files..."
find backend -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
find backend -name "*.pyc" -delete 2>/dev/null || true

# Install frontend dependencies
echo ""
echo "📦 Cài đặt frontend dependencies..."
cd frontend
if [ -f "package-lock.json" ]; then
    npm ci
else
    npm install
fi
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Lỗi khi cài đặt frontend dependencies${NC}"
    cd ..
    exit 1
fi
cd ..

# Install backend dependencies
echo ""
echo "🐍 Cài đặt backend dependencies..."
cd backend

# Determine Python command
if command_exists python3; then
    PYTHON_CMD=python3
else
    PYTHON_CMD=python
fi

$PYTHON_CMD -m venv venv
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Lỗi khi tạo virtual environment${NC}"
    cd ..
    exit 1
fi

source venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Lỗi khi cài đặt Python dependencies${NC}"
    cd ..
    exit 1
fi
cd ..

# Check Docker containers
echo ""
echo "🐳 Kiểm tra Docker containers..."
if docker-compose ps >/dev/null 2>&1; then
    echo "Docker containers đang chạy"
else
    echo "Khởi động Docker containers..."
    docker-compose up -d postgres redis
    sleep 10
fi

# Test database connection
echo ""
echo "🔍 Kiểm tra kết nối database..."
if node test-database-connection.js; then
    echo -e "${GREEN}✅ Database connection successful${NC}"
else
    echo -e "${YELLOW}⚠️ Không thể kết nối database. Hãy đảm bảo Docker đang chạy.${NC}"
fi

# Run migrations
echo ""
echo "🔄 Chạy database migrations..."
cd backend
source venv/bin/activate
python manage.py makemigrations
python manage.py migrate
cd ..

echo ""
echo -e "${GREEN}✅ Khắc phục hoàn tất!${NC}"
echo "========================"
echo ""
echo "Bây giờ bạn có thể chạy:"
echo "1. docker-compose up -d"
echo "2. cd backend && source venv/bin/activate && python manage.py runserver"
echo "3. cd frontend && npm run dev"
echo ""
echo "🌐 Truy cập ứng dụng tại:"
echo "- Frontend: http://localhost:3000"
echo "- Backend: http://localhost:8000"
echo "- Admin: http://localhost:8000/admin"
echo ""