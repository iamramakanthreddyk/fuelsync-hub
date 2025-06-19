# 🤖 AGENT SETUP - FuelSync Hub

**MANDATORY INSTRUCTIONS FOR AI AGENTS AND AUTOMATED SYSTEMS**

## 🚨 CRITICAL REQUIREMENTS

### ⚠️ YOU MUST USE YOUR OWN DATABASE
- **DO NOT** connect to external databases
- **DO NOT** use production credentials  
- **DO NOT** rely on existing .env files
- **DO NOT** assume database exists

### ✅ YOU MUST SETUP YOUR OWN ENVIRONMENT
- **MUST** start local PostgreSQL container
- **MUST** set environment variables
- **MUST** verify setup before proceeding

---

## 🔧 MANDATORY SETUP STEPS

### 1. Start Your Database (REQUIRED)
```bash
# This creates YOUR database - do not skip
docker run --name fuelsync-agent-db -p 5432:5432 \
  -e POSTGRES_DB=fuelsync_dev \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -d postgres:13

# Wait for database to start
sleep 5
```

### 2. Set Environment Variables (REQUIRED)
```bash
# Copy these exact commands
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=fuelsync_dev
export DB_USER=postgres
export DB_PASSWORD=postgres
export DB_SSL=false
export JWT_SECRET=agent-jwt-secret
export PORT=3001
export NODE_ENV=development
```

### 3. Install Dependencies (REQUIRED)
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

### 4. Setup Database (REQUIRED)
```bash
cd backend
npm run db:setup
cd ..
```

### 5. Start Application (REQUIRED)
```bash
npm run dev
```

---

## ✅ VERIFICATION

After setup, verify these work:

```bash
# Test database connection
cd backend && npm run db:check

# Test API
curl http://localhost:3001/api/health

# Test frontend
curl http://localhost:3000
```

**Login**: http://localhost:3000
- Email: owner@demofuel.com
- Password: password123

---

## 🚨 AGENT COMPLIANCE

### BEFORE YOU START CODING:
1. ✅ Database container is running
2. ✅ Environment variables are set
3. ✅ `npm run db:check` passes
4. ✅ Application starts successfully
5. ✅ Login works in browser

### IF SETUP FAILS:
```bash
# Reset everything
docker stop fuelsync-agent-db
docker rm fuelsync-agent-db

# Start over from step 1
```

---

## 🔧 AVAILABLE COMMANDS

Once setup is complete:

```bash
# Database operations
npm run db setup    # Complete setup
npm run db check    # Test connection
npm run db fix      # Fix relationships
npm run db reset    # Reset to clean state

# Development
npm run dev         # Start both servers
npm run dev:backend # Backend only
npm run dev:frontend # Frontend only
```

---

## 🎯 SUCCESS CRITERIA

You have successfully set up when:
- ✅ PostgreSQL container is running on port 5432
- ✅ Environment variables are configured
- ✅ Database schema is created
- ✅ Seed data is loaded
- ✅ Frontend accessible at http://localhost:3000
- ✅ Backend API accessible at http://localhost:3001
- ✅ Login works with provided credentials

**Only proceed with development tasks after achieving all success criteria.**