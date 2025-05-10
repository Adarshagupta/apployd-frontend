#!/bin/bash

# Define colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print a styled message
print_message() {
  echo -e "${GREEN}==>${NC} $1"
}

# Print a warning
print_warning() {
  echo -e "${YELLOW}Warning:${NC} $1"
}

# Print an error
print_error() {
  echo -e "${RED}Error:${NC} $1"
}

# Check if a process is running on a port
check_port() {
  if lsof -i:$1 > /dev/null 2>&1; then
    return 0 # Port is in use
  else
    return 1 # Port is free
  fi
}

# Kill process running on a specific port
kill_port_process() {
  print_warning "Killing process on port $1..."
  PID=$(lsof -t -i:$1)
  if [ ! -z "$PID" ]; then
    kill -9 $PID
    sleep 1
    print_message "Process $PID on port $1 terminated"
  fi
}

# Check if a service is accessible at a URL
check_service() {
  local service_name="$1"
  local service_url="$2"
  local expected_status="$3"
  
  print_message "Checking $service_name at $service_url..."
  
  # Use curl to check the service
  response=$(curl -s -o /dev/null -w "%{http_code}" "$service_url" 2>/dev/null || echo "failed")
  
  if [ "$response" == "$expected_status" ]; then
    print_message "$service_name is running (status: $response)"
    return 0
  else
    if [ "$response" == "failed" ]; then
      print_error "$service_name is not accessible (connection failed)"
    else
      print_error "$service_name is not accessible (expected: $expected_status, got: $response)"
    fi
    return 1
  fi
}

# Make sure we're in the right directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
NEON_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
UI_DIR="$SCRIPT_DIR"

# Start with a clean environment
cleanup() {
  print_message "Cleaning up processes..."
  
  # Kill specific processes
  pkill -f "node postgres-server.js" || true
  pkill -f "vite.*neon-ui" || true
  
  # Kill any processes on our ports
  PORTS=(3081 5173 5174 5175 7676 9898 50051 55433)
  for PORT in "${PORTS[@]}"; do
    if check_port $PORT; then
      kill_port_process $PORT
    fi
  done
  
  print_message "Cleanup complete."
}

# Set up cleanup on exit
trap cleanup EXIT INT TERM

# Print welcome message
print_message "Starting Neon Full-Stack Environment"

# First, clean up UI processes only
cleanup

# Check if Neon backend is already running
print_message "Checking if Neon backend services are already running..."

BACKEND_RUNNING=false
if check_port 3080 && check_port 9898; then
  # Verify the services are responding properly
  if check_service "Compute API" "http://localhost:3080/status" "200"; then
    print_message "Neon backend appears to be already running"
    BACKEND_RUNNING=true
  else
    print_warning "Neon backend ports are in use but services are not responding properly"
  fi
fi

# Start Neon backend if it's not already running
if [ "$BACKEND_RUNNING" = false ]; then
  print_message "Starting Neon backend services..."
  
  # Ensure we're starting from a clean state
  print_message "Stopping any running Docker containers..."
  cd "$NEON_ROOT"
  docker-compose down 2>/dev/null || true
  
  cd "$NEON_ROOT"
  bash ./start-neon.sh &
  NEON_PID=$!
  
  # Wait for the Neon backend to start
  print_message "Waiting for Neon backend to start (this may take a minute)..."
  MAX_ATTEMPTS=30
  ATTEMPT=1
  
  while ! curl -s http://localhost:3080/status > /dev/null && [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
    print_message "Waiting for compute service to become available... ($ATTEMPT/$MAX_ATTEMPTS)"
    sleep 2
    ATTEMPT=$((ATTEMPT+1))
  done
  
  if [ $ATTEMPT -gt $MAX_ATTEMPTS ]; then
    print_error "Timed out waiting for Neon backend to start."
    exit 1
  fi
  
  print_message "Neon backend is up and running!"
else
  print_message "Using existing Neon backend services"
fi

# Start the Neon UI
print_message "Starting Neon UI..."
cd "$UI_DIR"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  print_message "Installing dependencies..."
  npm install
fi

# Set a specific port for Vite to avoid conflicts
VITE_PORT=5173
if check_port $VITE_PORT; then
  VITE_PORT=5174
  if check_port $VITE_PORT; then
    VITE_PORT=5175
    if check_port $VITE_PORT; then
      VITE_PORT=5176
    fi
  fi
fi

# Start the Express server
print_message "Starting Express API server on port 3081..."
node postgres-server.js &
POSTGRES_SERVER_PID=$!

# Check if Express server started successfully
sleep 2
if ! ps -p $POSTGRES_SERVER_PID > /dev/null; then
  print_error "Express server failed to start. Port 3081 might be in use."
  cleanup
  exit 1
fi

# Wait a bit more to ensure the server is fully initialized
sleep 1

# Verify Express server is responding
check_service "Express API" "http://localhost:3081/api/auth/login" "400"

# Start the Vite dev server with a specific port
print_message "Starting Vite development server on port $VITE_PORT..."
npx vite --port $VITE_PORT --clearScreen false &
VITE_PID=$!

# Check if Vite started successfully
sleep 3
if ! ps -p $VITE_PID > /dev/null; then
  print_error "Vite server failed to start."
  cleanup
  exit 1
fi

print_message "🚀 Full-stack environment is running!"
print_message "🔗 Neon UI: http://localhost:$VITE_PORT"
print_message "🔗 API Server: http://localhost:3081"
print_message "🔗 Compute API: http://localhost:3080"
print_message "Press Ctrl+C to stop all services"

# Run a quick service check to verify everything is connected
print_message "Running service check..."
bash "$UI_DIR/check-services.sh"

# Keep the script running until Ctrl+C
wait $VITE_PID 