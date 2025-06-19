#!/bin/bash

# 🤖 AGENT BOOTSTRAP - Fully Automated Setup
# This script sets up everything automatically - no manual steps required

set -e

echo "🤖 Starting FuelSync Hub Agent Bootstrap..."
echo "This will set up everything automatically - no manual intervention needed."
echo ""

# 1. Start database automatically
echo "🐳 Starting PostgreSQL database..."
docker run --name fuelsync-agent-db -p 5432:5432 \
  -e POSTGRES_DB=fuelsync_dev \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -d postgres:13 || echo "Database container may already exist"

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# 2. Set environment variables automatically
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=fuelsync_dev
export DB_USER=postgres
export DB_PASSWORD=postgres
export DB_SSL=false
export JWT_SECRET=agent-jwt-secret-key
export JWT_EXPIRES_IN=24h
export PORT=3001
export NODE_ENV=development

echo "✅ Environment variables configured automatically"

# 3. Install dependencies
echo "📦 Installing dependencies..."
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..

# 4. Setup database
echo "🗄️ Setting up database..."
cd backend
npm run db:setup
cd ..

# 5. Verify setup
echo "🔍 Verifying setup..."
cd backend
npm run db:check
cd ..

echo ""
echo "🎉 Agent Bootstrap Complete!"
echo ""
echo "✅ Database: Running on localhost:5432"
echo "✅ Environment: Configured automatically"
echo "✅ Dependencies: Installed"
echo "✅ Database: Schema created and seeded"
echo ""
echo "🚀 Ready to start development:"
echo "   npm run dev"
echo ""
echo "🌐 Access URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo ""
echo "🔐 Login Credentials:"
echo "   Email: owner@demofuel.com"
echo "   Password: password123"