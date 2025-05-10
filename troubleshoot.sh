#!/bin/bash

# Make sure we're in the neon-ui directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"
echo "Working directory: $(pwd)"

echo "===== PostgreSQL Connection Troubleshooting ====="
echo ""

# Check if PostgreSQL is installed
echo "1. Checking PostgreSQL installation..."
if command -v psql > /dev/null; then
  PSQL_VERSION=$(psql --version)
  echo "✅ PostgreSQL client found: $PSQL_VERSION"
else
  echo "❌ PostgreSQL client not found. Please install PostgreSQL."
  echo "   MacOS: brew install postgresql"
  echo "   Linux: sudo apt install postgresql"
  echo ""
fi

# Check if PostgreSQL service is running
echo ""
echo "2. Checking if PostgreSQL service is running..."
if command -v pg_isready > /dev/null; then
  pg_isready -h localhost -p 5432
  if [ $? -eq 0 ]; then
    echo "✅ PostgreSQL is running on localhost:5432"
  else
    echo "❌ PostgreSQL is not running on localhost:5432"
    echo "   Please start PostgreSQL service:"
    echo "   MacOS: brew services start postgresql"
    echo "   Linux: sudo service postgresql start"
  fi
else
  echo "❌ pg_isready not found. Cannot check if PostgreSQL is running."
fi

# Try to connect to PostgreSQL
echo ""
echo "3. Attempting to connect to PostgreSQL..."
if command -v psql > /dev/null; then
  # Try default connection parameters
  PGPASSWORD=postgres psql -h localhost -p 5432 -U postgres -c '\conninfo' postgres > /dev/null 2>&1
  if [ $? -eq 0 ]; then
    echo "✅ Successfully connected to PostgreSQL with:"
    echo "   - Host: localhost"
    echo "   - Port: 5432"
    echo "   - User: postgres"
    echo "   - Password: postgres"
    echo "   - Database: postgres"
  else
    echo "❌ Failed to connect with default parameters."
    echo "   Checking alternative connection options..."
    
    # Try without password
    psql -h localhost -p 5432 -U postgres -c '\conninfo' postgres > /dev/null 2>&1
    if [ $? -eq 0 ]; then
      echo "✅ Connected without password. PostgreSQL using trust authentication."
      echo "   - Host: localhost"
      echo "   - Port: 5432"
      echo "   - User: postgres"
      echo "   - Database: postgres"
    else
      # Try with current system user
      local_user=$(whoami)
      psql -h localhost -p 5432 -U "$local_user" -c '\conninfo' postgres > /dev/null 2>&1
      if [ $? -eq 0 ]; then
        echo "✅ Connected with system user: $local_user"
        echo "   - Host: localhost"
        echo "   - Port: 5432"
        echo "   - User: $local_user"
        echo "   - Database: postgres"
        
        # Update the API files to use this user
        echo ""
        echo "Updating connection parameters in neonApi.js to use $local_user..."
        sed -i.bak "s/user: 'postgres'/user: '$local_user'/" src/api/neonApi.js
        sed -i.bak "s/password: 'postgres'/password: ''/" src/api/neonApi.js
        
        echo "Updating connection parameters in postgres-server.js..."
        sed -i.bak "s/user: 'postgres'/user: '$local_user'/" postgres-server.js
        sed -i.bak "s/password: 'postgres'/password: ''/" postgres-server.js
        
        echo "✅ Connection parameters updated to use your system user."
      else
        echo "❌ Could not connect to PostgreSQL with any standard credentials."
        echo "   Please check your PostgreSQL installation and authentication settings."
        echo "   - Verify PostgreSQL is running"
        echo "   - Check your authentication method (md5, trust, peer, etc.)"
        echo "   - Ensure user 'postgres' exists and has proper permissions"
      fi
    fi
  fi
fi

# List existing databases
echo ""
echo "4. Listing existing databases..."
if command -v psql > /dev/null; then
  if PGPASSWORD=postgres psql -h localhost -p 5432 -U postgres -c '\l' postgres > /dev/null 2>&1; then
    echo "Existing databases:"
    PGPASSWORD=postgres psql -h localhost -p 5432 -U postgres -c '\l' postgres | grep -v template | grep -v postgres
  elif psql -h localhost -p 5432 -U postgres -c '\l' postgres > /dev/null 2>&1; then
    echo "Existing databases (trust auth):"
    psql -h localhost -p 5432 -U postgres -c '\l' postgres | grep -v template | grep -v postgres
  elif psql -h localhost -p 5432 -U "$(whoami)" -c '\l' postgres > /dev/null 2>&1; then
    echo "Existing databases (as $(whoami)):"
    psql -h localhost -p 5432 -U "$(whoami)" -c '\l' postgres | grep -v template | grep -v postgres
  else
    echo "❌ Could not list databases. Connection failed."
  fi
else
  echo "❌ psql not found. Cannot list databases."
fi

echo ""
echo "===== Application Health Check ====="

# Check if the PostgreSQL API server is running
echo ""
echo "5. Checking PostgreSQL API server status..."
if pgrep -f "node postgres-server.js" > /dev/null; then
  echo "✅ PostgreSQL API server is running"
  # Try to connect to the API server
  if command -v curl > /dev/null; then
    curl -s http://localhost:3081/api/databases > /dev/null
    if [ $? -eq 0 ]; then
      echo "✅ Successfully connected to API server at http://localhost:3081"
    else
      echo "❌ API server is running but connection failed"
    fi
  fi
else
  echo "❌ PostgreSQL API server is not running"
fi

# Check if Vite dev server is running
echo ""
echo "6. Checking Vite development server status..."
if pgrep -f "node.*vite" > /dev/null; then
  echo "✅ Vite development server is running"
else
  echo "❌ Vite development server is not running"
fi

echo ""
echo "===== Next Steps ====="
echo "1. Fix any issues identified above"
echo "2. Run ./run_here.sh to start the application"
echo "3. Access the application at http://localhost:5173"
echo ""
echo "For any issues, check the console output for error messages" 