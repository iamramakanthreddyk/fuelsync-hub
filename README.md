# FuelSync Hub

A multi-tenant SaaS platform for fuel station management. The system allows station owners to manage their fuel stations, pumps, nozzles, and sales records. It supports different user roles, price management, sales recording, and financial reconciliation.

## Features

- Multi-tenant architecture with schema isolation
- Role-based access control (owner, manager, employee)
- Station management
- Pump and nozzle configuration
- Fuel price management with historical tracking
- Sales recording system
- Credit tracking and payment settlement
- Shift management and tender entries
- Day reconciliation
- User-station assignment

## Tech Stack

- **Frontend**: React/Next.js
- **Backend**: Node.js with Express
- **Database**: PostgreSQL with tenant isolation via schemas
- **Authentication**: JWT-based for admin, session-based for tenant users

## Getting Started

### Prerequisites

- Node.js (v14+)
- PostgreSQL (v12+) or Azure PostgreSQL
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your database connection:
   ```bash
   npm run db:env
   ```
   This interactive script will help you configure your database connection parameters.

4. Test your database connection:
   ```bash
   npm run db:check
   ```
   If you encounter any issues, refer to the [Database Setup and Troubleshooting Guide](DATABASE_SETUP.md) or the [Troubleshooting Guide](TROUBLESHOOTING.md).

5. Set up the database schema and seed data:
   ```bash
   npm run db:setup
   ```
   
   If you encounter issues with the schema setup, try applying it in chunks:
   ```bash
   npm run db:schema:chunks
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with the following variables:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Database Configuration

The application is configured to work with Azure PostgreSQL by default:

```typescript
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false
  }
});
```

This configuration:
- Connects to the Azure PostgreSQL server
- Uses SSL with `rejectUnauthorized: false` to accept self-signed certificates
- Uses the database name, user, and password from the `.env` file

For more details on database configuration and troubleshooting, see the [Database Setup and Troubleshooting Guide](DATABASE_SETUP.md).

## Database Management

### Database Scripts

- **Configure Database Connection**: `npm run db:env` - Interactive setup for database connection
- **Check Database Connection**: `npm run db:check` - Test your database connection
- **Debug Database Schema**: `npm run db:debug` - Check the status of tables, enums, and functions
- **Apply Schema in Chunks**: `npm run db:schema:chunks` - Apply schema in smaller chunks to identify issues
- **Setup Database**: `npm run db:setup` - Apply schema and seed data
- **Apply Schema Only**: `npm run db:schema` - Apply only the schema without seed data
- **Seed Data Only**: `npm run db:seed` - Seed data without modifying schema
- **Reset Database**: `npm run db:reset` - Reset and recreate the database

## Troubleshooting

If you encounter issues with the database setup or other aspects of the application, refer to the following guides:

- [Database Setup and Troubleshooting Guide](DATABASE_SETUP.md) - Detailed guide for database setup and troubleshooting
- [Troubleshooting Guide](TROUBLESHOOTING.md) - Solutions for common issues, including the "relation does not exist" error

## Default Users

After running the seed script, the following users will be available:

### Tenant Users
- **Owner**: owner@demo.com / owner123
- **Manager**: manager@demo.com / manager123
- **Employee**: employee@demo.com / employee123

### Admin Users
- **Superadmin**: admin@fuelsync.com / admin123

## API Documentation

API documentation is available at `http://localhost:3001/api/docs` when the backend server is running.

## Project Structure

```
fuelsync-hub/
├── backend/
│   ├── db/
│   │   ├── schema.sql         # Complete database schema
│   │   ├── seed.ts            # Seed data script
│   │   ├── setup-db.ts        # Database setup script
│   │   ├── check-connection.ts # Database connection test
│   │   ├── debug-schema.ts    # Schema debugging tool
│   │   ├── apply-schema-in-chunks.ts # Apply schema in chunks
│   │   └── setup-local-env.ts # Interactive env setup
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   ├── controllers/       # Request handlers
│   │   ├── middlewares/       # Express middlewares
│   │   ├── models/            # Data models
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   ├── types/             # TypeScript type definitions
│   │   ├── utils/             # Utility functions
│   │   ├── app.ts             # Express application setup
│   │   └── server.ts          # Server entry point
│   └── package.json           # Backend dependencies
├── frontend/
│   ├── public/                # Static assets
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── contexts/          # React contexts
│   │   ├── hooks/             # Custom React hooks
│   │   ├── pages/             # Next.js pages
│   │   ├── services/          # API services
│   │   ├── styles/            # CSS styles
│   │   └── utils/             # Utility functions
│   └── package.json           # Frontend dependencies
├── DATABASE_SETUP.md          # Database setup guide
├── TROUBLESHOOTING.md         # Troubleshooting guide
├── CLEANUP.md                 # Project cleanup guide
└── README.md                  # Project documentation
```

## License

This project is licensed under the ISC License.