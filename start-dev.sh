#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting FuelSync Hub Development Servers...${NC}"
echo ""

# Function to start backend
start_backend() {
    echo -e "${GREEN}Starting Backend Server (Port 3001)...${NC}"
    cd backend
    npm run dev &
    BACKEND_PID=$!
    cd ..
    echo "Backend PID: $BACKEND_PID"
}

# Function to start frontend
start_frontend() {
    echo -e "${GREEN}Starting Frontend Server (Port 3000)...${NC}"
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    echo "Frontend PID: $FRONTEND_PID"
}

# Start both servers
start_backend
sleep 3
start_frontend

echo ""
echo -e "${GREEN}✅ Both servers are starting...${NC}"
echo ""
echo "🌐 Access URLs:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:3001"
echo "   - Debug Page: http://localhost:3000/debug"
echo ""
echo "🔐 Login Credentials:"
echo "   - Owner: owner@demofuel.com / password123"
echo "   - Manager: manager@demofuel.com / password123"
echo "   - Employee: employee@demofuel.com / password123"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user interrupt
trap 'echo ""; echo "Stopping servers..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit' INT
wait