# FuelSync Hub

A comprehensive multi-tenant fuel station management platform built with Node.js, Express, PostgreSQL, and Next.js.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- npm

### Automated Setup (Recommended)

**Unix/Linux/macOS:**
```bash
chmod +x setup.sh
./setup.sh
```

**Windows:**
```cmd
setup.bat
```

### Manual Setup

1. **Install Dependencies**
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Configure Database**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your PostgreSQL credentials
   ```

3. **Setup Database**
   ```bash
   npm run db:setup
   ```

4. **Start Development Servers**
   
   **Option A: Automated (Recommended)**
   ```bash
   # Unix/Linux/macOS
   ./start-dev.sh
   
   # Windows
   start-dev.bat
   ```
   
   **Option B: Manual**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev
   
   # Terminal 2 - Frontend  
   cd frontend && npm run dev
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

## 🛠️ Common Commands

### Database Operations
```bash
cd backend

# Fix data relationships
npm run db:fix

# Reset database
npm run db:reset

# Check database connection
npm run db:check

# Verify seed data
npm run db:verify-seed
```

### Development
```bash
# Backend development server
cd backend && npm run dev

# Frontend development server
cd frontend && npm run dev

# Build for production
cd backend && npm run build
cd frontend && npm run build
```

## 📁 Project Structure

```
fuelsync-hub/
├── backend/          # Node.js/Express API
├── frontend/         # Next.js React app
├── docs/            # Documentation
├── scripts/         # Utility scripts
├── setup.sh         # Unix setup script
├── setup.bat        # Windows setup script
├── start-dev.sh     # Unix dev server script
└── start-dev.bat    # Windows dev server script
```

## 🏗️ Architecture

- **Backend**: Node.js + Express + TypeScript + PostgreSQL
- **Frontend**: Next.js + React + TypeScript + Material-UI
- **Database**: Multi-tenant PostgreSQL with schema separation
- **Authentication**: JWT-based with role-based access control

## 📚 Documentation

- [Project Structure](PROJECT_STRUCTURE.md) - Detailed project organization
- [Database Operations](DATABASE_OPERATIONS.md) - Database management guide
- [Data Flow Diagram](DATA_FLOW_DIAGRAM.md) - System relationships
- [User Guide](USER_GUIDE.md) - End-user documentation
- [Troubleshooting](TROUBLESHOOTING.md) - Common issues and solutions

## 🔧 Features

### Multi-Tenant Architecture
- Separate data isolation per tenant
- Role-based access control (Owner, Manager, Employee)
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

### Dashboard & Analytics
- Real-time KPIs
- Sales trends and reports
- Credit management

## 🐛 Troubleshooting

### Common Issues

1. **"Station ID is required" error**
   ```bash
   cd backend && npm run db:fix
   ```

2. **"stations.map is not a function" error**
   ```bash
   cd backend && npm run db:fix
   ```

3. **Database connection issues**
   - Ensure PostgreSQL is running
   - Check .env credentials
   - Run: `npm run db:check`

4. **Token validation errors**
   - Clear browser localStorage
   - Re-login to get fresh token

### Debug Tools
- Visit http://localhost:3000/debug for debugging tools
- Built-in API tester and token inspector
- Database relationship checker

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For issues and questions:
1. Check the [Troubleshooting Guide](TROUBLESHOOTING.md)
2. Use the debug page at http://localhost:3000/debug
3. Review the [Database Operations Guide](DATABASE_OPERATIONS.md)

---

**Happy coding! 🚀**