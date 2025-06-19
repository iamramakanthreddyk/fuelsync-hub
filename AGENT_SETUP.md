# 🤖 Agent Setup Guide - FuelSync Hub

**For AI agents, automated systems, and headless environments**

## 🎯 Quick Agent Setup (No .env files needed)

### 1. Start Local Database
```bash
# Start PostgreSQL container
docker run --name fuelsync-db -p 5432:5432 \
  -e POSTGRES_DB=fuelsync_dev \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -d postgres:13

# Wait for database to be ready
sleep 5
```

### 2. Set Environment Variables
```bash
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=fuelsync_dev
export DB_USER=postgres
export DB_PASSWORD=postgres
export DB_SSL=false
export PORT=3001
export NODE_ENV=development
export JWT_SECRET=agent-jwt-secret-key
export JWT_EXPIRES_IN=24h
```

### 3. Setup and Run
```bash
# Install dependencies
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..

# Setup database (uses environment variables)
cd backend
npm run db:setup

# Start application
npm run dev
```

## 🔧 Agent-Friendly Commands

All commands work with environment variables (no .env files):

```bash
# Database operations
npm run db setup    # Complete setup
npm run db check    # Test connection  
npm run db fix      # Fix relationships
npm run db reset    # Clean slate

# Development
npm run dev         # Start both servers
```

## 🎯 Default Access

After setup, use these credentials:
- **URL**: http://localhost:3000
- **Login**: owner@demofuel.com / password123

## 🐳 Docker Alternative

For completely isolated setup:

```bash
# Create docker-compose.yml
cat > docker-compose.yml << EOF
version: '3.8'
services:
  postgres:
    image: postgres:13
    environment:
      POSTGRES_DB: fuelsync_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
EOF

# Start database
docker-compose up -d

# Set environment and run
export DB_HOST=localhost DB_PORT=5432 DB_NAME=fuelsync_dev DB_USER=postgres DB_PASSWORD=postgres DB_SSL=false
npm run db:setup
```

## ✅ Verification

Check if setup worked:
```bash
# Test database
npm run db:check

# Test API
curl http://localhost:3001/api/health

# Test frontend
curl http://localhost:3000
```

## 🚨 Agent Notes

- **No .env files required** - All configuration via environment variables
- **Self-contained** - Starts own database, no external dependencies
- **Automated** - All commands work headlessly
- **Predictable** - Same setup every time