#!/bin/bash

echo "===== Fixing Neon UI Connectivity Issues ====="

# Kill all existing processes
echo "Stopping all existing processes..."
pkill -f postgres-server.js || true
pkill -f vite || true
lsof -ti:3081 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true
lsof -ti:5174 | xargs kill -9 2>/dev/null || true
lsof -ti:5175 | xargs kill -9 2>/dev/null || true
lsof -ti:5176 | xargs kill -9 2>/dev/null || true

# Wait a moment for ports to be released
echo "Waiting for ports to be released..."
sleep 3

# Start only the server first to ensure it's running
echo "Starting PostgreSQL server..."
node postgres-server.js &
SERVER_PID=$!

# Wait for server to start
echo "Waiting for server to initialize (5 seconds)..."
sleep 5

# Check if server is running
if ! ps -p $SERVER_PID > /dev/null; then
  echo "ERROR: Server failed to start. Exiting."
  exit 1
fi

echo "Server is running on http://localhost:3081"
echo "Starting Vite frontend on a separate port..."

# Start Vite on a different port
npx vite --port 5180

echo "Frontend started at http://localhost:5180"
echo "===== Connectivity fix complete =====" 