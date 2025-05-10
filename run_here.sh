#!/bin/bash

# Make sure we're in the neon-ui directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"
echo "Working directory: $(pwd)"

# Check PostgreSQL connection
echo "Testing PostgreSQL connection..."

# Print connection parameters
echo "Using connection:"
echo "- Host: localhost"
echo "- Port: 5432"
echo "- User: postgres"
echo "- Database: postgres"

# Try to connect to PostgreSQL
if command -v psql > /dev/null; then
  if psql -h localhost -p 5432 -U postgres -c '\l' postgres > /dev/null 2>&1; then
    echo "PostgreSQL connection successful!"
  else
    echo "WARNING: Could not connect to PostgreSQL. Make sure PostgreSQL is running with these settings."
    echo "Databases will be simulated but not actually created."
  fi
else
  echo "WARNING: PostgreSQL client not found. Install PostgreSQL for full functionality."
fi

# Kill any existing processes
echo "Stopping any existing servers..."
pkill -f "node postgres-server.js" > /dev/null 2>&1 || true
pkill -f "node.*vite" > /dev/null 2>&1 || true

# Start server
echo "Starting PostgreSQL API server..."
node postgres-server.js &
PG_PID=$!

# Wait a moment for the server to start
sleep 2

# Start frontend
echo "Starting Vite development server..."
npx vite &
VITE_PID=$!

# Cleanup on exit
function cleanup() {
  echo "Stopping servers..."
  kill $PG_PID $VITE_PID > /dev/null 2>&1 || true
  exit 0
}

trap cleanup SIGINT SIGTERM EXIT

echo ""
echo "Application is running!"
echo "- Frontend: http://localhost:5173"
echo "- API Server: http://localhost:3081"
echo ""
echo "Press Ctrl+C to stop all servers."

# Keep the script running
wait 