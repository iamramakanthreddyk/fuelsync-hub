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

echo -e "${BLUE}🚀 Starting FuelSync Hub Setup...${NC}"
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

# Install dependencies
print_status "Installing dependencies..."
npm run setup
print_success "Dependencies installed"

# Backend setup
if [ -d "backend" ]; then
    print_status "Setting up backend..."
    cd backend || exit 1
    # Environment: Codex/Test-safe setup
    if [ "$CI" = "true" ] || [ "$CODEX_MODE" = "true" ]; then
    print_status "Using in-memory/test database configuration (CI or Codex mode)"
    export DB_HOST=localhost
    export DB_PORT=5432
    export DB_NAME=test_fuelsync
    export DB_USER=postgres
    export DB_PASSWORD=postgres
    export DB_SSL=false
    else
    # Local dev fallback
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
        print_warning ".env not found → creating from example"
        cp .env.example .env

        # 👇 This should be skipped in headless mode
        if [ -t 0 ]; then
            print_warning "Please update .env with your DB credentials"
            read -p "Press Enter after updating .env to continue..."
        else
            print_warning "Headless mode detected — skipping .env prompt"
        fi
        else
        print_error "Missing .env and .env.example. Aborting setup."
        exit 1
        fi
    else
        print_success ".env file found"
    fi
    fi

    # Test database connection
    print_status "Testing database connection..."
    if npm run db:check; then
        print_success "Database connection successful"
    else
        print_error "Database connection failed. Please check your .env configuration."
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
else
    print_error "backend folder not found."
    exit 1
fi

echo ""
print_success "🎉 FuelSync Hub setup completed successfully!"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo ""
echo "1. Start development servers:"
echo "   npm run dev"
echo ""
echo "2. Or start individually:"
echo "   npm run dev:backend    # Port 3001"
echo "   npm run dev:frontend   # Port 3000"
echo ""
echo "3. Access the application:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:3001"
echo ""
echo -e "${BLUE}🔐 Default Login Credentials:${NC}"
echo "   - Owner: owner@demofuel.com / password123"
echo "   - Manager: manager@demofuel.com / password123"
echo "   - Employee: employee@demofuel.com / password123"
echo "   - Admin: admin@fuelsync.com / admin123"
echo ""
echo -e "${BLUE}🛠️ Database Commands:${NC}"
echo "   npm run db setup    # Complete setup"
echo "   npm run db fix      # Fix relationships"
echo "   npm run db check    # Test connection"
echo "   npm run db verify   # Verify setup"
echo ""
print_success "Setup complete! Happy coding! 🚀"