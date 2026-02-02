#!/bin/bash

# Script to run both API and Web servers for AppointmentApp
# Usage: ./start.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_DIR="$SCRIPT_DIR/api"
WEB_DIR="$SCRIPT_DIR/web"

# PID files for tracking processes
API_PID_FILE="/tmp/appointment_api.pid"
WEB_PID_FILE="/tmp/appointment_web.pid"

# Default ports
API_PORT=${API_PORT:-3000}
WEB_PORT=${WEB_PORT:-5173}

# Function to print colored messages
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to cleanup processes on exit
cleanup() {
    print_message "$YELLOW" "\nShutting down servers..."
    
    if [ -f "$API_PID_FILE" ]; then
        API_PID=$(cat "$API_PID_FILE")
        if kill -0 "$API_PID" 2>/dev/null; then
            print_message "$YELLOW" "Stopping API server (PID: $API_PID)..."
            kill "$API_PID" 2>/dev/null || true
            wait "$API_PID" 2>/dev/null || true
        fi
        rm -f "$API_PID_FILE"
    fi
    
    if [ -f "$WEB_PID_FILE" ]; then
        WEB_PID=$(cat "$WEB_PID_FILE")
        if kill -0 "$WEB_PID" 2>/dev/null; then
            print_message "$YELLOW" "Stopping Web server (PID: $WEB_PID)..."
            kill "$WEB_PID" 2>/dev/null || true
            wait "$WEB_PID" 2>/dev/null || true
        fi
        rm -f "$WEB_PID_FILE"
    fi
    
    print_message "$GREEN" "All servers stopped."
    exit 0
}

# Set up trap for cleanup on script exit
trap cleanup SIGINT SIGTERM EXIT

# Function to start the API server
start_api() {
    print_message "$BLUE" "Starting API server on port $API_PORT..."
    
    if check_port $API_PORT; then
        print_message "$RED" "Error: Port $API_PORT is already in use. Please stop the existing process or set a different API_PORT."
        exit 1
    fi
    
    cd "$API_DIR"
    
    # Check if bundle is installed
    if ! command -v bundle &> /dev/null; then
        print_message "$RED" "Error: Bundler is not installed. Please install it with 'gem install bundler'"
        exit 1
    fi
    
    # Install dependencies if needed
    if [ ! -d "vendor/bundle" ] && [ ! -f ".bundle/config" ]; then
        print_message "$YELLOW" "Installing API dependencies..."
        bundle install
    fi
    
    # Start Rails server in background
    bundle exec rails server -p $API_PORT -b 0.0.0.0 &
    echo $! > "$API_PID_FILE"
    
    print_message "$GREEN" "API server started (PID: $(cat $API_PID_FILE))"
}

# Function to start the Web server
start_web() {
    print_message "$BLUE" "Starting Web server on port $WEB_PORT..."
    
    if check_port $WEB_PORT; then
        print_message "$RED" "Error: Port $WEB_PORT is already in use. Please stop the existing process or set a different WEB_PORT."
        exit 1
    fi
    
    cd "$WEB_DIR"
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        print_message "$RED" "Error: npm is not installed. Please install Node.js and npm."
        exit 1
    fi
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_message "$YELLOW" "Installing Web dependencies..."
        npm install
    fi
    
    # Start Vite dev server in background
    npm run dev -- --port $WEB_PORT --host &
    echo $! > "$WEB_PID_FILE"
    
    print_message "$GREEN" "Web server started (PID: $(cat $WEB_PID_FILE))"
}

# Main execution
main() {
    print_message "$GREEN" "=========================================="
    print_message "$GREEN" "   AppointmentApp Development Servers"
    print_message "$GREEN" "=========================================="
    echo ""
    
    # Start both servers
    start_api
    start_web
    
    echo ""
    print_message "$GREEN" "=========================================="
    print_message "$GREEN" "   Both servers are now running!"
    print_message "$GREEN" "=========================================="
    echo ""
    print_message "$BLUE" "API Server:  http://localhost:$API_PORT"
    print_message "$BLUE" "Web Server:  http://localhost:$WEB_PORT"
    echo ""
    print_message "$YELLOW" "Press Ctrl+C to stop all servers"
    echo ""
    
    # Wait for both processes
    wait
}

# Run main function
main
