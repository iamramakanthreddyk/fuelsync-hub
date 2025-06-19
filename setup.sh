#!/bin/bash

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() { echo -e "${BLUE}🔧 $1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }

echo -e "${BLUE}🚀 Starting FuelSync Hub Setup... from setup.sh${NC}"
echo ""

# Check Node.js
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

# Check environment variables
if [ -z "$DB_HOST" ] || [ -z "$DB_PORT" ] || [ -z "$DB_NAME" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ]; then
    print_error "Required environment variables not set!"
    echo ""
    echo "Please set these environment variables:"
    echo "export DB_HOST=localhost"
    echo "export DB_PORT=5432"
    echo "export DB_NAME=fuelsync_dev"
    echo "export DB_USER=postgres"
    echo "export DB_PASSWORD=postgres"
    echo "export DB_SSL=false"
    echo ""
    echo "Or start a local database:"
    echo "docker run --name fuelsync-db -p 5432:5432 -e POSTGRES_DB=fuelsync_dev -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -d postgres:13"
    exit 1
fi

print_success "Environment variables configured"

# Install dependencies
print_status "Installing dependencies..."
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
print_success "Dependencies installed"

# Backend setup
print_status "Setting up backend..."
cd backend || exit 1

# Test database connection
print_status "Testing database connection..."
if npm run db:check; then
    print_success "Database connection successful"
else
    print_error "Database connection failed. Please check your environment variables."
    exit 1
fi

# Setup database
print_status "Setting up database..."
if npm run db:setup; then
    print_success "Database setup completed"
else
    print_error "Database setup failed"
    exit 1
fi

# Verify setup
print_status "Verifying database setup..."
npm run db:verify || print_warning "Database verification had issues, but continuing..."

cd ..

echo ""
print_success "🎉 FuelSync Hub setup completed successfully!"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo ""
echo "1. Start development servers:"
echo "   npm run dev"
echo ""
echo "2. Access the application:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:3001"
echo ""
echo -e "${BLUE}🔐 Default Login Credentials:${NC}"
echo "   - Owner: owner@demofuel.com / password123"
echo "   - Manager: manager@demofuel.com / password123"
echo "   - Employee: employee@demofuel.com / password123"
echo ""
print_success "Setup complete! Happy coding! 🚀"