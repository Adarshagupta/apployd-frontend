#!/bin/bash

# Kill any existing server processes
echo "Stopping any existing server processes..."
pkill -f postgres-server.js || true
pkill -f vite || true

# Wait a moment for ports to be released
sleep 2

# Start the server
echo "Starting the server..."
npm run dev

echo "Server started successfully." 