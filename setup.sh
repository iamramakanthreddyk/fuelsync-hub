#!/bin/bash
export CODEX_MODE=true
set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${BLUE}🔧 $1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }

echo -e "${BLUE}🚀 Starting FuelSync Hub Setup...${NC}"
echo ""
if [ "$CI" = "true" ] || [ "$CODEX_MODE" = "true" ]; then
  print_status "Detected CI or Codex Mode — Using test DB config"
else
  print_status "Detected Developer Mode — Loading from .env"
fi

# Node check
if ! command -v node &> /dev/null; then
  print_error "Node.js not installed"
  exit 1
fi

print_success "Node.js $(node --version) detected"

# npm check
if ! command -v npm &> /dev/null; then
  print_error "npm not installed"
  exit 1
fi

print_success "npm $(npm --version) detected"

# Root deps
print_status "Installing root dependencies..."
[ -f "package.json" ] && npm install || print_warning "No root package.json found"

# Backend setup
if [ -d "backend" ]; then
  cd backend

  print_status "Installing backend dependencies..."
  npm install

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
        print_status "Please update .env with your DB credentials"
        read -p "Press Enter after updating .env to continue..."
      else
        print_error "Missing .env and .env.example. Aborting setup."
        exit 1
      fi
    else
      print_success ".env file found"
    fi
  fi

  print_status "Running DB migrations + seed..."
  npm run db:setup || (print_error "DB setup failed" && exit 1)

  print_status "Verifying seed data..."
  npm run db:verify-seed || print_warning "Seed verification failed"

  cd ..
else
  print_error "Missing backend/ directory"
  exit 1
fi

# Frontend setup
if [ -d "frontend" ]; then
  cd frontend
  print_status "Installing frontend dependencies..."
  npm install
  cd ..
else
  print_error "Missing frontend/ directory"
  exit 1
fi

# Completion
echo ""
print_success "🎉 FuelSync Hub setup complete!"

echo ""
echo -e "${BLUE}🔐 Default Credentials:${NC}"
echo "Owner: owner@demofuel.com / password123"
echo "Manager: manager@demofuel.com / password123"
echo "Employee: employee@demofuel.com / password123"
echo "Admin: admin@fuelsync.com / admin123"

echo ""
echo -e "${BLUE}🧪 Dev Commands:${NC}"
echo "Backend: cd backend && npm run dev"
echo "Frontend: cd frontend && npm run dev"
