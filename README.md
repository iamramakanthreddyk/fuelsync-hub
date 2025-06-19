# FuelSync Hub

A comprehensive multi-tenant fuel station management platform built with Node.js, Express, PostgreSQL, and Next.js.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- npm

### Automated Setup (Recommended)

```bash
# Unix/Linux/macOS
chmod +x setup.sh && ./setup.sh

# Windows
setup.bat
```

### Manual Setup

```bash
# 1. Install dependencies
npm run setup

# 2. Configure database
cd backend
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# 3. Setup database
npm run db:setup

# 4. Start development
npm run dev
```

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
npm run db setup         # Complete database setup
npm run db reset         # Reset database to clean state
npm run db check         # Test database connection
npm run db fix           # Fix data relationships
npm run db verify        # Verify database setup
```

### Utilities
```bash
npm run setup            # Install all dependencies
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
│   └── package.json    # Backend dependencies
├── frontend/           # Next.js React app
│   ├── src/            # Source code
│   └── package.json    # Frontend dependencies
├── scripts/            # Utility scripts
│   └── db.ts          # Unified database management
├── setup.sh           # Unix setup script
├── setup.bat          # Windows setup script
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
   npm run db check     # Test connection
   ```

2. **Missing relationships**
   ```bash
   npm run db fix       # Fix relationships
   ```

3. **Clean slate needed**
   ```bash
   npm run db reset     # Reset everything
   ```

### Debug Tools
- Visit http://localhost:3000/debug for debugging tools
- Built-in API tester and token inspector

## 📚 Documentation

- [Database Operations](DATABASE_OPERATIONS.md) - Database management guide
- [Project Structure](PROJECT_STRUCTURE.md) - Detailed project organization
- [Troubleshooting](TROUBLESHOOTING.md) - Common issues and solutions

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