#!/bin/bash

# Script to start both backend and frontend in development mode
# Usage: ./start-dev.sh

echo "🚀 Starting AppointmentApp Development Servers..."
echo ""

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    kill $(jobs -p) 2>/dev/null
    exit
}

# Trap SIGINT (Ctrl+C) and call cleanup
trap cleanup SIGINT

# Start backend
echo "📡 Starting Rails API on http://localhost:3000..."
(cd api && bundle exec rails server) &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "⚛️  Starting React Web App on http://localhost:5173..."
(cd web && npm run dev) &
FRONTEND_PID=$!

echo ""
echo "✅ Services started!"
echo ""
echo "   Backend API:  http://localhost:3000"
echo "   Web App:      http://localhost:5173"
echo "   Health Check: http://localhost:3000/health"
echo ""
echo "📝 Logs will appear below. Press Ctrl+C to stop all services."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Wait for all background processes
wait
