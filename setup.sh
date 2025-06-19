#!/bin/bash

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}🔧 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

echo -e "${BLUE}🚀 Starting FuelSync Hub Setup...${NC}"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node --version)"
    exit 1
fi

print_success "Node.js $(node --version) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm and try again."
    exit 1
fi

print_success "npm $(npm --version) detected"

# 1. Root Dependencies Setup
print_status "Installing root dependencies..."
if [ -f "package.json" ]; then
    npm install
    print_success "Root dependencies installed"
else
    print_warning "No root package.json found, skipping root dependencies"
fi

# 2. Backend Setup
if [ -d "backend" ]; then
    print_status "Setting up backend..."
    cd backend || exit 1
    
    # Install backend dependencies
    print_status "Installing backend dependencies..."
    npm install
    print_success "Backend dependencies installed"
    
    # Check for .env file
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            print_warning ".env file not found. Creating from .env.example..."
            cp .env.example .env
            print_warning "Please update the .env file with your database credentials before proceeding"
            print_warning "Database configuration needed:"
            echo "  - DB_HOST (your PostgreSQL host)"
            echo "  - DB_PORT (usually 5432)"
            echo "  - DB_NAME (your database name)"
            echo "  - DB_USER (your database user)"
            echo "  - DB_PASSWORD (your database password)"
            echo ""
            read -p "Press Enter after updating .env file to continue..."
        else
            print_error ".env.example file not found. Please create .env file manually."
            exit 1
        fi
    else
        print_success ".env file found"
    fi
    
    # Test database connection
    print_status "Testing database connection..."
    if npm run db:check; then
        print_success "Database connection successful"
    else
        print_error "Database connection failed. Please check your .env configuration."
        print_warning "Make sure PostgreSQL is running and credentials are correct."
        exit 1
    fi
    
    # Setup database schema and seed data
    print_status "Setting up database schema and seed data..."
    if npm run db:setup; then
        print_success "Database setup completed"
    else
        print_error "Database setup failed"
        exit 1
    fi
    
    # Verify database setup
    print_status "Verifying database setup..."
    if npm run db:verify-seed; then
        print_success "Database verification passed"
    else
        print_warning "Database verification had issues, but continuing..."
    fi
    
    cd ..
else
    print_error "backend folder not found. This is required for FuelSync Hub."
    exit 1
fi

# 3. Frontend Setup
if [ -d "frontend" ]; then
    print_status "Setting up frontend..."
    cd frontend || exit 1
    
    # Install frontend dependencies
    print_status "Installing frontend dependencies..."
    npm install
    print_success "Frontend dependencies installed"
    
    cd ..
else
    print_error "frontend folder not found. This is required for FuelSync Hub."
    exit 1
fi

# 4. Final verification and instructions
echo ""
print_success "🎉 FuelSync Hub setup completed successfully!"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo ""
echo "1. Start the backend server:"
echo "   cd backend && npm run dev"
echo ""
echo "2. In a new terminal, start the frontend:"
echo "   cd frontend && npm run dev"
echo ""
echo "3. Access the application:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:3001"
echo "   - Debug page: http://localhost:3000/debug"
echo ""
echo -e "${BLUE}🔐 Default Login Credentials:${NC}"
echo "   - Owner: owner@demofuel.com / password123"
echo "   - Manager: manager@demofuel.com / password123"
echo "   - Employee: employee@demofuel.com / password123"
echo "   - Admin: admin@fuelsync.com / admin123"
echo ""
echo -e "${BLUE}🛠️ Useful Commands:${NC}"
echo "   - Fix data relationships: cd backend && npm run db:fix"
echo "   - Reset database: cd backend && npm run db:reset"
echo "   - Check database: cd backend && npm run db:check"
echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo "   - Database Operations: DATABASE_OPERATIONS.md"
echo "   - User Guide: USER_GUIDE.md"
echo "   - Troubleshooting: TROUBLESHOOTING.md"
echo ""
print_success "Setup complete! Happy coding! 🚀"