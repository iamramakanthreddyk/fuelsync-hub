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
npm run db reset
cd ..
npm run dev
```

Running `npm run db reset` cleans the database before seeding. This prevents duplicate key errors like `admin_users_email_key` when starting over.

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
npm run db reset
npm run dev
```

`npm run db reset` ensures the container starts with a clean database so seeding works without duplicate key conflicts.

## 🌐 Access URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Debug Page**: http://localhost:3000/debug

## 🔐 Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Owner | owner@demofuel.com | password123 |
| Manager | manager@demofuel.com | password123 |
| Employee | employee@demofuel.com | password123 |
| Admin | admin@fuelsync.com | admin123 |

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
npm run db reset         # Clean DB then seed
npm run db:setup         # Setup without cleaning
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
│   ├── db/             # Database scripts (4 essential files)
│   │   ├── setup-db.ts     # Schema creation
│   │   ├── seed.ts         # Data seeding
│   │   ├── fix-relationships.ts # Fix relationships
│   │   └── check-connection.ts  # Test connection
│   └── package.json    # Backend dependencies
├── frontend/           # Next.js React app
│   ├── src/            # Source code
│   └── package.json    # Frontend dependencies
└── package.json       # Root workspace configuration
```

## 🔧 Key Features

### Multi-Tenant Architecture
- Separate data isolation per tenant
- Role-based access control (Owner, Manager, Employee, Admin)
- Scalable tenant management

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

3. **Permission denied errors**
   ```bash
   cd backend && npm run db reset
   ```
   Cleaning the database helps prevent duplicate key errors like `admin_users_email_key`.

4. **Clean slate needed**
   ```bash
   # Reset everything
   cd backend && npm run db reset
   ```
   This drops and recreates the database before seeding.

### Debug Tools
- Visit http://localhost:3000/debug for debugging tools
- Built-in API tester and token inspector

## 📚 Documentation

- [Database Operations](DATABASE_OPERATIONS.md) - Database management guide
- [Project Structure](PROJECT_STRUCTURE.md) - Detailed project organization
- [Troubleshooting](TROUBLESHOOTING.md) - Common issues and solutions
- [Agent Setup](AGENT_SETUP.md) - For AI agents and automated systems

## 🤖 For AI Agents

Use the automated bootstrap script:

```bash
chmod +x agent-bootstrap.sh
./agent-bootstrap.sh
```

This handles everything automatically - database, environment, dependencies, and setup.

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