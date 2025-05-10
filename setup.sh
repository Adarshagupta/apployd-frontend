#!/bin/bash

echo "Setting up Neon UI..."

# Make sure we're in the neon-ui directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"
echo "Working directory: $(pwd)"

# Check if PostgreSQL is running
echo "Checking if PostgreSQL is installed and running..."
if which pg_isready > /dev/null; then
  pg_isready
  PG_STATUS=$?
  if [ $PG_STATUS -ne 0 ]; then
    echo "WARNING: PostgreSQL is not running. Database creation will be simulated."
    echo "Please start PostgreSQL to enable actual database creation."
  else
    echo "PostgreSQL is running and ready."
  fi
else
  echo "WARNING: PostgreSQL command line tools not found. Database creation will be simulated."
  echo "Please install PostgreSQL to enable actual database creation."
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Create a run script for convenience
cat > run.sh << 'EOF'
#!/bin/bash

# Kill any existing node processes for this project
echo "Stopping any existing servers..."
pkill -f "node postgres-server.js" 2>/dev/null || true
pkill -f "node.*vite" 2>/dev/null || true

# Start PostgreSQL API server
echo "Starting PostgreSQL API server..."
node postgres-server.js &
PG_SERVER_PID=$!

# Start Vite development server
echo "Starting Vite development server..."
npm run client &
VITE_PID=$!

# Function to handle termination
cleanup() {
  echo "Stopping servers..."
  kill $PG_SERVER_PID $VITE_PID 2>/dev/null || true
  exit 0
}

# Set up trap to handle Ctrl+C and other termination signals
trap cleanup SIGINT SIGTERM

echo "Servers started! Visit http://localhost:5173 in your browser."
echo "Press Ctrl+C to stop all servers."

# Wait for both processes to finish
wait
EOF

# Make the run script executable
chmod +x run.sh

echo "Setup complete. Run './run.sh' to start the application."
echo "For testing, you can also run:"
echo "  - npm run server (PostgreSQL API server only)"
echo "  - npm run client (Frontend only)"
echo "  - npm run dev    (Both servers together)"

# Ask user if they want to start the application now
read -p "Start the application now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  ./run.sh
fi 