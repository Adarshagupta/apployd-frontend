#!/bin/bash

# Make sure we're in the neon-ui directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"
echo "Working directory: $(pwd)"

# Kill any existing processes
echo "Stopping any existing servers..."
pkill -f "node postgres-server.js" > /dev/null 2>&1 || true
pkill -f "node.*vite" > /dev/null 2>&1 || true

# Start PostgreSQL API server
echo "Starting PostgreSQL API server..."
NODE_ENV=production node postgres-server.js &
PG_PID=$!

# Wait a moment for the server to start
sleep 2

# Start Vite development server
echo "Starting Vite development server..."
NODE_ENV=production npx vite &
VITE_PID=$!

# Function to handle script termination
function cleanup() {
  echo "Stopping servers..."
  kill $PG_PID $VITE_PID > /dev/null 2>&1 || true
  exit 0
}

# Set up trap to handle Ctrl+C and other termination signals
trap cleanup SIGINT SIGTERM EXIT

echo ""
echo "Application is running!"
echo "- Frontend: http://localhost:5173"
echo "- API Server: http://localhost:3081"
echo ""
echo "Press Ctrl+C to stop all servers."

# Wait for both processes to finish
wait
