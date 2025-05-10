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

# Check if a service is accessible at a URL
check_service() {
  local service_name="$1"
  local service_url="$2"
  local expected_status="$3"
  
  print_message "Checking $service_name at $service_url..."
  
  # Use curl to check the service
  response=$(curl -s -o /dev/null -w "%{http_code}" "$service_url" 2>/dev/null)
  
  if [ "$response" == "$expected_status" ]; then
    print_message "$service_name is running (status: $response)"
    return 0
  else
    print_error "$service_name is not accessible (expected: $expected_status, got: $response)"
    return 1
  fi
}

# Check if a port is in use
check_port() {
  local port="$1"
  
  if lsof -i:$port > /dev/null 2>&1; then
    return 0 # Port is in use
  else
    return 1 # Port is free
  fi
}

# Print banner
echo "========================================="
echo "🔍 Neon Services Status Check"
echo "========================================="

# Check Express API Server
if check_port 3081; then
  print_message "Express API server is running on port 3081"
  
  # Verify API server is responding
  if check_service "Express API" "http://localhost:3081/api/auth/login" "400"; then
    print_message "Express API server is responding to requests"
  else
    print_warning "Express API server is running but may not be functioning correctly"
  fi
else
  print_error "Express API server is not running on port 3081"
fi

# Check Compute Service
if check_port 3080; then
  print_message "Compute service is running on port 3080"
  
  # Verify compute service is responding
  if check_service "Compute API" "http://localhost:3080/status" "200"; then
    print_message "Compute service is responding to requests"
  else
    print_warning "Compute service is running but may not be functioning correctly"
  fi
else
  print_error "Compute service is not running on port 3080"
fi

# Check Pageserver
if check_port 9898; then
  print_message "Pageserver is running on port 9898"
  
  # Verify pageserver is responding
  if check_service "Pageserver API" "http://localhost:9898/v1/status" "200"; then
    print_message "Pageserver is responding to requests"
  else
    print_warning "Pageserver is running but may not be functioning correctly"
  fi
else
  print_error "Pageserver is not running on port 9898"
fi

# Check Safekeeper
if check_port 7676; then
  print_message "Safekeeper is running on port 7676"
else
  print_error "Safekeeper is not running on port 7676"
fi

# Check Storage Broker
if check_port 50051; then
  print_message "Storage broker is running on port 50051"
else
  print_error "Storage broker is not running on port 50051"
fi

# Check PostgreSQL
if check_port 5432; then
  print_message "Local PostgreSQL is running on port 5432"
else
  print_warning "Local PostgreSQL is not running on port 5432"
fi

if check_port 55433; then
  print_message "Neon PostgreSQL is running on port 55433"
else
  print_warning "Neon PostgreSQL is not running on port 55433"
fi

echo "========================================="
echo "✅ Status check complete"
echo "========================================="

echo "🔍 Checking Neon UI services..."

# Check Express API server
if curl -s http://localhost:3081/api/databases > /dev/null; then
  echo "✅ Express API server is running at http://localhost:3081"
else
  echo "❌ Express API server is NOT running"
fi

# Check Vite frontend server
if curl -s http://localhost:5175 > /dev/null; then
  echo "✅ Vite frontend server is running at http://localhost:5175"
else
  echo "❌ Vite frontend server is NOT running"
fi

# Check Neon Postgres
if pg_isready -h localhost -p 55433 -U cloud_admin > /dev/null; then
  echo "✅ Neon PostgreSQL is running on port 55433"
else
  echo "❌ Neon PostgreSQL is NOT running on port 55433"
fi

# Check databases
DB_COUNT=$(curl -s http://localhost:3081/api/databases | grep -o '"id"' | wc -l)
if [ "$DB_COUNT" -gt 0 ]; then
  echo "✅ Database registry contains $DB_COUNT databases"
else
  echo "❌ No databases found in registry"
fi

echo ""
echo "💡 If any services are not running, use ./start-full-stack.sh to start them" 