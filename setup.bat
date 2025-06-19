@echo off
setlocal enabledelayedexpansion

echo 🚀 Starting FuelSync Hub Setup from bat...
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

REM Check environment variables
if "%DB_HOST%"=="" (
    echo ❌ Required environment variables not set!
    echo.
    echo Please set these environment variables:
    echo $env:DB_HOST="localhost"
    echo $env:DB_PORT="5432"
    echo $env:DB_NAME="fuelsync_dev"
    echo $env:DB_USER="postgres"
    echo $env:DB_PASSWORD="postgres"
    echo $env:DB_SSL="false"
    echo.
    echo Or start a local database:
    echo docker run --name fuelsync-db -p 5432:5432 -e POSTGRES_DB=fuelsync_dev -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -d postgres:13
    pause
    exit /b 1
)

echo ✅ Environment variables configured
echo.

REM Install dependencies
echo 🔧 Installing dependencies...
npm install
if errorlevel 1 (
    echo ❌ Failed to install root dependencies
    pause
    exit /b 1
)

cd backend
npm install
if errorlevel 1 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)

cd ..\frontend
npm install
if errorlevel 1 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)

cd ..\backend
echo ✅ Dependencies installed

REM Test database connection
echo 🔧 Testing database connection...
npm run db:check
if errorlevel 1 (
    echo ❌ Database connection failed. Please check your environment variables.
    pause
    exit /b 1
)
echo ✅ Database connection successful

REM Setup database
echo 🔧 Setting up database...
npm run db:setup
if errorlevel 1 (
    echo ❌ Database setup failed
    pause
    exit /b 1
)
echo ✅ Database setup completed

cd ..

echo.
echo ✅ 🎉 FuelSync Hub setup completed successfully!
echo.
echo 📋 Next Steps:
echo.
echo 1. Start development servers:
echo    npm run dev
echo.
echo 2. Access the application:
echo    - Frontend: http://localhost:3000
echo    - Backend API: http://localhost:3001
echo.
echo 🔐 Default Login Credentials:
echo    - Owner: owner@demofuel.com / password123
echo    - Manager: manager@demofuel.com / password123
echo    - Employee: employee@demofuel.com / password123
echo.
echo ✅ Setup complete! Happy coding! 🚀
echo.
pause