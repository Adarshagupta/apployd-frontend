#!/bin/bash

echo "🔄 Completely restarting Neon UI Full Stack..."

# Ensure we're in the correct directory
cd "$(dirname "$0")"

# Kill all existing processes
echo "🧹 Cleaning up all existing processes..."
pkill -f postgres-server.js
pkill -f "vite.*neon-ui"
pkill -f "node.*neon-ui"

# Wait a moment to ensure ports are released
sleep 2

# Synchronize the database registry to make sure all databases are accounted for
echo "🔄 Starting PostgreSQL API server..."
node postgres-server.js &
EXPRESS_PID=$!

# Wait a bit for the server to start
sleep 3
echo "✅ Express API server running at http://localhost:3081"

# Verify the server is running
if ! curl -s http://localhost:3081/api/sync-databases > /dev/null; then
  echo "❌ Failed to start Express server. Please check for errors."
  exit 1
fi

# Start the Vite dev server in development mode
echo "🌐 Starting Vite development server..."
npm run dev -- --port 5175 &
VITE_PID=$!

echo "✅ Vite server will be available at http://localhost:5175"
echo ""
echo "📊 Services started successfully!"
echo "- API Server: http://localhost:3081"
echo "- Frontend: http://localhost:5175"
echo ""
echo "💡 Press Ctrl+C to stop all services"

# Handle clean exit
trap "echo '🛑 Stopping services...'; kill $EXPRESS_PID $VITE_PID 2>/dev/null; exit" INT TERM

# Keep script running
wait 