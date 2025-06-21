# FuelSync Hub

A comprehensive multi-tenant fuel station management platform built with Node.js, Express, PostgreSQL, and Next.js.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 12+ OR Docker
- npm

### Option 1: Automated Setup (Recommended)

```bash
# Set environment variables
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=fuelsync_dev
export DB_USER=postgres
export DB_PASSWORD=postgres
export DB_SSL=false

# Install and setup
npm install
cd backend && npm install
cd ../frontend && npm install
cd ../backend
npm run db:reset
cd ..
npm run dev
```

### Option 2: Docker Database

```bash
# Start PostgreSQL container
docker run --name fuelsync-db -p 5432:5432 \
  -e POSTGRES_DB=fuelsync_dev \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -d postgres:13

# Set environment variables and setup
export DB_HOST=localhost DB_PORT=5432 DB_NAME=fuelsync_dev DB_USER=postgres DB_PASSWORD=postgres DB_SSL=false
cd backend && npm run db:reset
cd .. && npm run dev
```

## 🌐 Access URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Debug Page**: http://localhost:3000/debug
- **Admin Panel**: http://localhost:3000/admin/login

## 🔐 Default Login Credentials

| Role | Email | Password | Access |
|------|-------|----------|---------|
| **Admin** | admin@fuelsync.com | admin123 | Platform management |
| **Owner** | owner@demofuel.com | password123 | All stations |
| **Manager** | manager@demofuel.com | password123 | Assigned stations |
| **Employee** | employee@demofuel.com | password123 | Single station |

## 🛠️ Development Commands

### Application
```bash
npm run dev              # Start both backend and frontend
npm run dev:backend      # Start backend only (port 3001)
npm run dev:frontend     # Start frontend only (port 3000)
npm run build            # Build for production
```

### Database Management
```bash
npm run db:setup         # Complete database setup with seed data
npm run db:reset         # Clean database and setup fresh (RECOMMENDED)
npm run db:clean         # Clean database only (no setup)
npm run db:check         # Test database connection
npm run db:fix           # Fix user-station relationships
npm run db:verify        # Verify database setup
```

### Utilities
```bash
npm install              # Install all dependencies
npm run clean            # Clean all node_modules and build files
```

## 🏗️ Architecture

- **Backend**: Node.js + Express + TypeScript + PostgreSQL
- **Frontend**: Next.js + React + TypeScript + Material-UI
- **Database**: Multi-tenant PostgreSQL with schema separation
- **Authentication**: JWT-based with role-based access control

## 📁 Project Structure

```
fuelsync-hub/
├── backend/             # Node.js/Express API
│   ├── src/            # Source code
│   ├── db/             # Database scripts (5 essential files)
│   │   ├── setup-db.ts     # Schema creation
│   │   ├── seed.ts         # Data seeding
│   │   ├── fix-relationships.ts # Fix relationships
│   │   ├── reset-db.ts     # Clean database
│   │   └── check-connection.ts  # Test connection
│   └── package.json    # Backend dependencies
├── frontend/           # Next.js React app
│   ├── src/            # Source code
│   ├── next.config.js  # Next.js configuration
│   └── package.json    # Frontend dependencies
└── package.json       # Root configuration and scripts
```

## 🔧 Key Features

### Multi-Tenant Architecture
- Separate data isolation per tenant
- Role-based access control (Admin, Owner, Manager, Employee)
- Scalable tenant management

### Admin Panel
- SuperAdmin dashboard for platform management
- Tenant CRUD operations
- User management across tenants
- Platform statistics and monitoring

### Station Management
- Multiple stations per tenant
- Pump and nozzle management
- Fuel pricing management

### Sales Management
- Real-time sales recording
- Multiple payment methods (Cash, Card, UPI, Credit)
- Sales reporting and analytics

### User Management
- User-to-station assignments
- Role-based permissions
- Secure authentication

## 🐛 Troubleshooting

### Common Issues

1. **Database connection errors**
   ```bash
   # Check environment variables
   echo $DB_HOST $DB_PORT $DB_NAME $DB_USER
   
   # Test connection
   cd backend && npm run db:check
   ```

2. **"No stations found" error**
   ```bash
   cd backend && npm run db:fix
   ```

3. **"Tenant must have at least one active station"**
   ```bash
   cd backend && npm run db:reset
   ```

4. **Duplicate key errors during seeding**
   ```bash
   cd backend && npm run db:reset
   ```

5. **Permission denied errors**
   ```bash
   cd backend && npm run db:reset
   ```

6. **Clean slate needed**
   ```bash
   # Reset everything (RECOMMENDED for most issues)
   cd backend && npm run db:reset
   ```

### Debug Tools
- Visit http://localhost:3000/debug for debugging tools
- Built-in API tester and token inspector

## 📚 Documentation

- [Database Operations](DATABASE_OPERATIONS.md) - Database management guide
- [Project Structure](PROJECT_STRUCTURE.md) - Detailed project organization
- [Troubleshooting](TROUBLESHOOTING.md) - Common issues and solutions
- [Usage Guide](USAGE_GUIDE.md) - How to use the application
- [Agent Setup](AGENT_SETUP.md) - For AI agents and automated systems

## 🤖 For AI Agents

Use the automated bootstrap script:

```bash
chmod +x agent-bootstrap.sh
./agent-bootstrap.sh
```

This handles everything automatically - database, environment, dependencies, and setup.

## 🧪 Testing APIs

### Authentication
```bash
# User login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@demofuel.com","password":"password123"}'

# Admin login
curl -X POST http://localhost:3001/api/admin-auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fuelsync.com","password":"admin123"}'
```

### SuperAdmin APIs
```bash
# Get all tenants
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  http://localhost:3001/api/superadmin/tenants

# Get platform stats
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  http://localhost:3001/api/superadmin/stats
```

### Station APIs
```bash
# Get all stations
curl -H "Authorization: Bearer YOUR_USER_TOKEN" \
  http://localhost:3001/api/stations
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

---

**Happy coding! 🚀**