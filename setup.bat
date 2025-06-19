@echo off
setlocal enabledelayedexpansion

echo 🚀 Starting FuelSync Hub Setup...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ and try again.
    pause
    exit /b 1
)

echo ✅ Node.js detected: 
node --version

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed. Please install npm and try again.
    pause
    exit /b 1
)

echo ✅ npm detected:
npm --version
echo.

REM 1. Root Dependencies Setup
echo 🔧 Installing root dependencies...
if exist package.json (
    npm install
    if errorlevel 1 (
        echo ❌ Failed to install root dependencies
        pause
        exit /b 1
    )
    echo ✅ Root dependencies installed
) else (
    echo ⚠️ No root package.json found, skipping root dependencies
)
echo.

REM 2. Backend Setup
if exist backend (
    echo 🔧 Setting up backend...
    cd backend
    
    REM Install backend dependencies
    echo 🔧 Installing backend dependencies...
    npm install
    if errorlevel 1 (
        echo ❌ Failed to install backend dependencies
        pause
        exit /b 1
    )
    echo ✅ Backend dependencies installed
    
    REM Check for .env file
    if not exist .env (
        if exist .env.example (
            echo ⚠️ .env file not found. Creating from .env.example...
            copy .env.example .env
            echo ⚠️ Please update the .env file with your database credentials before proceeding
            echo Database configuration needed:
            echo   - DB_HOST (your PostgreSQL host)
            echo   - DB_PORT (usually 5432)
            echo   - DB_NAME (your database name)
            echo   - DB_USER (your database user)
            echo   - DB_PASSWORD (your database password)
            echo.
            pause
        ) else (
            echo ❌ .env.example file not found. Please create .env file manually.
            pause
            exit /b 1
        )
    ) else (
        echo ✅ .env file found
    )
    
    REM Test database connection
    echo 🔧 Testing database connection...
    npm run db:check
    if errorlevel 1 (
        echo ❌ Database connection failed. Please check your .env configuration.
        echo ⚠️ Make sure PostgreSQL is running and credentials are correct.
        pause
        exit /b 1
    )
    echo ✅ Database connection successful
    
    REM Setup database schema and seed data
    echo 🔧 Setting up database schema and seed data...
    npm run db:setup
    if errorlevel 1 (
        echo ❌ Database setup failed
        pause
        exit /b 1
    )
    echo ✅ Database setup completed
    
    REM Verify database setup
    echo 🔧 Verifying database setup...
    npm run db:verify-seed
    if errorlevel 1 (
        echo ⚠️ Database verification had issues, but continuing...
    ) else (
        echo ✅ Database verification passed
    )
    
    cd ..
) else (
    echo ❌ backend folder not found. This is required for FuelSync Hub.
    pause
    exit /b 1
)
echo.

REM 3. Frontend Setup
if exist frontend (
    echo 🔧 Setting up frontend...
    cd frontend
    
    REM Install frontend dependencies
    echo 🔧 Installing frontend dependencies...
    npm install
    if errorlevel 1 (
        echo ❌ Failed to install frontend dependencies
        pause
        exit /b 1
    )
    echo ✅ Frontend dependencies installed
    
    cd ..
) else (
    echo ❌ frontend folder not found. This is required for FuelSync Hub.
    pause
    exit /b 1
)
echo.

REM 4. Final verification and instructions
echo.
echo ✅ 🎉 FuelSync Hub setup completed successfully!
echo.
echo 📋 Next Steps:
echo.
echo 1. Start the backend server:
echo    cd backend ^&^& npm run dev
echo.
echo 2. In a new terminal, start the frontend:
echo    cd frontend ^&^& npm run dev
echo.
echo 3. Access the application:
echo    - Frontend: http://localhost:3000
echo    - Backend API: http://localhost:3001
echo    - Debug page: http://localhost:3000/debug
echo.
echo 🔐 Default Login Credentials:
echo    - Owner: owner@demofuel.com / password123
echo    - Manager: manager@demofuel.com / password123
echo    - Employee: employee@demofuel.com / password123
echo    - Admin: admin@fuelsync.com / admin123
echo.
echo 🛠️ Useful Commands:
echo    - Fix data relationships: cd backend ^&^& npm run db:fix
echo    - Reset database: cd backend ^&^& npm run db:reset
echo    - Check database: cd backend ^&^& npm run db:check
echo.
echo 📚 Documentation:
echo    - Database Operations: DATABASE_OPERATIONS.md
echo    - User Guide: USER_GUIDE.md
echo    - Troubleshooting: TROUBLESHOOTING.md
echo.
echo ✅ Setup complete! Happy coding! 🚀
echo.
pause