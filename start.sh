#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
echo -e "${BLUE}┌───────────────────────────────────────┐${NC}"
echo -e "${BLUE}│                                       │${NC}"
echo -e "${BLUE}│   ${GREEN}Neon Database UI - Development Mode   ${BLUE}│${NC}"
echo -e "${BLUE}│                                       │${NC}"
echo -e "${BLUE}└───────────────────────────────────────┘${NC}"
echo ""

# Check if docker is running
echo -e "${YELLOW}Checking if Docker is running...${NC}"
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}Docker is not running. Please start Docker and try again.${NC}"
  exit 1
fi
echo -e "${GREEN}Docker is running.${NC}"
echo ""

# Check if neon services are already running
NEON_CONTAINER_COUNT=$(docker ps --filter "name=docker-compose" --format '{{.Names}}' | wc -l | xargs)
if [ "$NEON_CONTAINER_COUNT" -gt 0 ]; then
  echo -e "${YELLOW}Neon services are already running. Starting the UI...${NC}"
else
  # Start Neon backend services
  echo -e "${YELLOW}Starting Neon backend services...${NC}"
  
  # Navigate to the parent directory to run the start-neon.sh script
  cd "$(dirname "$0")/.."
  if [ -f "./start-neon.sh" ]; then
    echo -e "${YELLOW}Running start-neon.sh...${NC}"
    # Run the script but don't wait for it to complete (avoid starting the UI)
    ./start-neon.sh --no-ui &
    NEON_PID=$!
    
    # Wait for a bit to ensure services are starting
    echo -e "${YELLOW}Waiting for services to start...${NC}"
    sleep 10
    
    # Check if services started successfully
    if ! docker ps | grep -q "docker-compose-compute-1"; then
      echo -e "${RED}Failed to start Neon services. Check the Docker logs.${NC}"
      exit 1
    fi
    
    echo -e "${GREEN}Neon services started successfully.${NC}"
  else
    echo -e "${RED}start-neon.sh not found in parent directory. Unable to start Neon services.${NC}"
    echo -e "${YELLOW}Make sure you're running this script from the neon-ui directory.${NC}"
    echo -e "${YELLOW}Continuing, but backend connectivity may not work...${NC}"
  fi
fi

# Navigate back to the UI directory
cd "$(dirname "$0")"
echo ""

# Check if PostgreSQL API server is already running
if pgrep -f "node postgres-server.js" > /dev/null; then
  echo -e "${YELLOW}PostgreSQL API server is already running. Restarting...${NC}"
  pkill -f "node postgres-server.js"
  sleep 2
fi

# Start PostgreSQL API server in the background
echo -e "${YELLOW}Starting PostgreSQL API server...${NC}"
node postgres-server.js &
PG_SERVER_PID=$!

# Wait for PostgreSQL API server to start
sleep 2
if ! pgrep -f "node postgres-server.js" > /dev/null; then
  echo -e "${RED}Failed to start PostgreSQL API server.${NC}"
  exit 1
fi
echo -e "${GREEN}PostgreSQL API server started successfully.${NC}"
echo ""

# Check if Vite dev server is already running
if pgrep -f "vite" > /dev/null; then
  echo -e "${YELLOW}Vite development server is already running. Restarting...${NC}"
  pkill -f "vite"
  sleep 2
fi

# Start Vite dev server
echo -e "${YELLOW}Starting Vite development server...${NC}"
echo -e "${BLUE}---------------------------------------------------${NC}"
echo -e "${GREEN}The UI will be available at: http://localhost:5173${NC}"
echo -e "${BLUE}---------------------------------------------------${NC}"
echo ""

npx vite

# Cleanup on exit
# Note: This works only if the script is terminated via Ctrl+C
# or other signals that allow for trap execution
cleanup() {
  echo -e "\n${YELLOW}Shutting down servers...${NC}"
  if [ -n "$PG_SERVER_PID" ]; then
    kill $PG_SERVER_PID 2>/dev/null
  fi
  pkill -f "node postgres-server.js" 2>/dev/null
  pkill -f "vite" 2>/dev/null
  echo -e "${GREEN}Servers shut down.${NC}"
}

trap cleanup EXIT INT TERM

# This point is never reached normally, as the Vite server runs in the foreground 