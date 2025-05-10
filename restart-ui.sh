#!/bin/bash

echo "🔄 Restarting Neon Frontend UI..."

# Ensure we're in the correct directory
cd "$(dirname "$0")"

# Kill any existing Vite server
echo "🔄 Cleaning up existing Vite process..."
pkill -f "vite.*neon-ui"

# Start the Vite dev server
echo "🌐 Starting Vite development server..."
npm run dev -- --port 5175 &
VITE_PID=$!

echo "✅ Vite server will be available at http://localhost:5175"
echo ""
echo "💡 Press Ctrl+C to stop the UI server"

# Handle clean exit
trap "echo '🛑 Stopping UI service...'; kill $VITE_PID 2>/dev/null; exit" INT TERM

# Keep script running
wait 