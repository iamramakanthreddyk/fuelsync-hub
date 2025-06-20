# FuelSync Hub - Usage Guide

## 🚀 How to Use FuelSync Hub

### Quick Start Options

#### Option 1: Manual Setup
```bash
# 1. Set environment variables
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=fuelsync_dev
export DB_USER=postgres
export DB_PASSWORD=postgres
export DB_SSL=false

# 2. Install and setup
npm install
cd backend && npm install && npm run db:reset
cd ../frontend && npm install
cd .. && npm run dev
```

#### Option 2: Docker Database
```bash
# 1. Start database
docker run --name fuelsync-db -p 5432:5432 \
  -e POSTGRES_DB=fuelsync_dev \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -d postgres:13

# 2. Setup and run
export DB_HOST=localhost DB_PORT=5432 DB_NAME=fuelsync_dev DB_USER=postgres DB_PASSWORD=postgres DB_SSL=false
cd backend && npm run db:reset
cd .. && npm run dev
```

#### Option 3: Agent Bootstrap (Fully Automated)
```bash
chmod +x agent-bootstrap.sh
./agent-bootstrap.sh
```

## 🌐 Accessing the Application

### URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Debug Tools**: http://localhost:3000/debug
- **Admin Panel**: http://localhost:3000/admin/login

### Default Login Credentials

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Admin** | admin@fuelsync.com | admin123 | Platform management |
| **Owner** | owner@demofuel.com | password123 | All stations |
| **Manager** | manager@demofuel.com | password123 | Assigned stations |
| **Employee** | employee@demofuel.com | password123 | Single station |

## 🎯 Using Different User Roles

### 🔧 Admin Role (SuperAdmin)
**Platform administration and tenant management**

**What you can do:**
- Manage all tenants (create, edit, delete)
- View platform statistics
- Manage users across all tenants
- Monitor system health
- Access admin panel at `/admin/login`

**Key Features:**
- Tenant management dashboard
- Platform-wide analytics
- User management across tenants
- System configuration

### 👑 Owner Role
**Full access to all business operations**

**What you can do:**
- View all stations and their data
- Create and manage stations
- Add/remove employees
- Assign users to stations
- View all sales and reports
- Manage fuel prices
- Handle credit customers

**Key Features:**
- Dashboard with all station KPIs
- User management interface
- Station creation and editing
- Sales analytics and reports

### 🧑‍💼 Manager Role
**Manage assigned stations**

**What you can do:**
- View assigned stations only
- Record sales transactions
- Submit nozzle readings
- View station reports
- Manage employees at assigned stations

**Key Features:**
- Station-specific dashboard
- Sales recording interface
- Employee management for assigned stations
- Station reports and analytics

### ⛽ Employee Role
**Daily operations at assigned station**

**What you can do:**
- Record sales at assigned station
- Submit daily nozzle readings
- View personal sales history
- Basic station information

**Key Features:**
- Simple sales recording
- Nozzle reading submission
- Personal performance tracking

## 📊 Key Features Usage

### 🔧 Admin Panel Usage

#### Accessing Admin Panel
1. Go to http://localhost:3000/admin/login
2. Login with admin@fuelsync.com / admin123
3. Navigate through admin dashboard

#### Managing Tenants
1. Go to Admin → Tenants
2. View all tenants in the system
3. Add new tenant with "Add Tenant" button
4. Edit existing tenants by clicking edit icon
5. Delete tenants if needed

#### Viewing Platform Stats
1. Admin dashboard shows:
   - Total tenants count
   - Total users count
   - Total stations count
   - Recent tenants list

### 🏪 Station Management

#### Creating a Station (Owner only)
1. Login as Owner
2. Go to Stations → Add New Station
3. Fill in station details (name, address, contact)
4. Save station

#### Adding Pumps and Nozzles
1. Go to Station Details
2. Click "Add Pump"
3. Enter pump details (name, serial number)
4. Add nozzles to pump (fuel type)

### 💰 Sales Recording

#### Recording a Sale
1. Login with appropriate role
2. Go to Sales → New Sale
3. Select nozzle and enter volume
4. Choose payment method
5. Submit sale

#### Viewing Sales Reports
1. Go to Reports → Sales
2. Filter by date range, station, or user
3. Export reports if needed

### 👥 User Management (Owner only)

#### Adding New Employee
1. Go to Users → Add User
2. Enter user details and role
3. Assign to stations
4. Set permissions

#### Managing Station Assignments
1. Go to Stations → Station Details
2. Click "Manage Users"
3. Add/remove user assignments
4. Set roles for each assignment

### ⛽ Fuel Price Management

#### Setting Fuel Prices
1. Go to Fuel Prices
2. Select station and fuel type
3. Enter new price
4. Set effective date
5. Save price

### 💳 Credit Customer Management

#### Adding Credit Customer
1. Go to Creditors → Add New
2. Enter customer details
3. Set credit limit
4. Save customer

#### Recording Credit Sale
1. Record sale as normal
2. Select "Credit" as payment method
3. Choose credit customer
4. Submit sale

## 🔧 Database Operations

### Essential Commands
```bash
cd backend

# Setup database (first time or reset)
npm run db:reset

# Test database connection
npm run db:check

# Fix user-station relationships
npm run db:fix

# Verify database setup
npm run db:verify

# Clean database only
npm run db:clean
```

### When to Use Each Command

#### `npm run db:reset` (RECOMMENDED)
- First-time setup
- After major changes
- When you need a clean slate
- If database is corrupted
- For most troubleshooting issues

#### `npm run db:setup`
- First-time setup only
- When database is already clean

#### `npm run db:check`
- Before starting development
- When troubleshooting connection issues
- To verify environment variables

#### `npm run db:fix`
- When users can't access stations
- After manual database changes
- When getting "No stations found" errors

#### `npm run db:verify`
- After setup to confirm everything works
- Before deploying to production
- When troubleshooting data issues

#### `npm run db:clean`
- When you want to manually setup after cleaning
- Before running custom setup scripts

## 🐛 Common Issues and Solutions

### "No stations found for this user"
```bash
cd backend && npm run db:fix
```

### "Tenant must have at least one active station"
```bash
cd backend && npm run db:reset
```

### "Database connection failed"
```bash
# Check environment variables
echo $DB_HOST $DB_PORT $DB_NAME $DB_USER

# Test connection
cd backend && npm run db:check
```

### "Duplicate key value violates unique constraint"
```bash
# Clean reset
cd backend && npm run db:reset
```

### "Permission denied"
```bash
# Reset database
cd backend && npm run db:reset
```

### Login not working
1. Clear browser cache/localStorage
2. Use correct credentials (see table above)
3. Check if backend is running on port 3001
4. Try database reset: `npm run db:reset`

### Admin panel not loading
1. Make sure you're accessing `/admin/login` not `/login`
2. Clear browser cache
3. Check backend is running
4. Try database reset

## 🎯 Development Workflow

### Starting Development
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev

# Or both together
npm run dev
```

### Making Changes
1. Make code changes
2. Test with different user roles
3. Verify database operations work
4. Check API endpoints
5. Test frontend functionality

### Testing Different Scenarios
1. Login as different user roles
2. Test station assignments
3. Record sample sales
4. Verify permissions work correctly
5. Test multi-tenant isolation
6. Test admin panel functionality

## 📚 API Usage

### Authentication
```bash
# User Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@demofuel.com","password":"password123"}'

# Admin Login
curl -X POST http://localhost:3001/api/admin-auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fuelsync.com","password":"admin123"}'

# Use token in subsequent requests
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/stations
```

### Key Endpoints
- `GET /api/stations` - List stations
- `POST /api/sales` - Record sale
- `GET /api/dashboard` - Dashboard data
- `GET /api/users` - List users
- `POST /api/fuel-prices` - Set fuel price
- `GET /api/superadmin/tenants` - List tenants (admin only)
- `GET /api/superadmin/stats` - Platform stats (admin only)

## 🎉 Success Indicators

### Setup Successful When:
- ✅ Frontend loads at http://localhost:3000
- ✅ Backend API responds at http://localhost:3001
- ✅ Login works with provided credentials
- ✅ Dashboard shows station data
- ✅ No "No stations found" errors
- ✅ Admin panel accessible at http://localhost:3000/admin/login

### Application Working When:
- ✅ Different user roles see appropriate data
- ✅ Sales can be recorded
- ✅ Station assignments work
- ✅ Reports display data
- ✅ All CRUD operations work
- ✅ Admin can manage tenants
- ✅ Platform stats are displayed

---

**Need Help?** Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) or [DATABASE_OPERATIONS.md](DATABASE_OPERATIONS.md)