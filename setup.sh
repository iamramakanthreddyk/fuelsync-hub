#!/bin/bash

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

# Check Node.js
if ! command -v node &> /dev/null; then
  print_error "Node.js is not installed."
  exit 1
fi

print_success "Node.js $(node --version) detected"

# Check npm
if ! command -v npm &> /dev/null; then
  print_error "npm is not installed."
  exit 1
fi

print_success "npm $(npm --version) detected"

# Install root dependencies
print_status "Installing root dependencies..."
[ -f "package.json" ] && npm install || print_warning "No root package.json found"

# Backend setup
if [ -d "backend" ]; then
  print_status "Setting up backend..."
  cd backend

  print_status "Installing backend dependencies..."
  npm install

  # Local test DB values (no .env required)
  export DB_HOST=localhost
  export DB_PORT=5432
  export DB_NAME=test_fuelsync
  export DB_USER=postgres
  export DB_PASSWORD=postgres
  export DB_SSL=false

  # Attempt to create database if it doesn't exist
  print_status "Ensuring database '$DB_NAME' exists..."
  psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
    psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -c "CREATE DATABASE $DB_NAME"

  # Test DB connection
  print_status "Testing DB connection..."
  npm run db:check && print_success "Database connection successful"

  # Migrate and seed
  print_status "Running migrations and seed..."
  npm run db:setup && print_success "Database setup complete"

  # Optional: verify
  print_status "Verifying DB seed..."
  npm run db:verify-seed || print_warning "Verification returned warnings"

  cd ..
else
  print_error "Missing backend/ directory"
  exit 1
fi

# Frontend setup
if [ -d "frontend" ]; then
  print_status "Setting up frontend..."
  cd frontend
  npm install
  cd ..
else
  print_warning "No frontend/ directory found, skipping"
fi

echo ""
print_success "🎉 FuelSync Hub setup complete!"
echo ""
echo -e "${BLUE}🧪 Commands:${NC}"
echo "  npm run dev:backend    # Start backend"
echo "  npm run dev:frontend   # Start frontend"
echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo "  See docs/README.md for usage, credentials, and more."
