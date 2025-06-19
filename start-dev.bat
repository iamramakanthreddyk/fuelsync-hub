@echo off
echo 🚀 Starting FuelSync Hub Development Servers...
echo.

echo ✅ Starting Backend Server (Port 3001)...
start "FuelSync Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

echo ✅ Starting Frontend Server (Port 3000)...
start "FuelSync Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ Both servers are starting...
echo.
echo 🌐 Access URLs:
echo    - Frontend: http://localhost:3000
echo    - Backend API: http://localhost:3001
echo    - Debug Page: http://localhost:3000/debug
echo.
echo 🔐 Login Credentials:
echo    - Owner: owner@demofuel.com / password123
echo    - Manager: manager@demofuel.com / password123
echo    - Employee: employee@demofuel.com / password123
echo.
echo ℹ️ Close the terminal windows to stop the servers
echo.
pause