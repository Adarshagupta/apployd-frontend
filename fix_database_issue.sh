#!/bin/bash

# Fix Database Issues Script
echo "=== Neon UI Database Fix Tool ==="
echo "This script will diagnose and fix issues with database creation and listing."

# Make sure we're in the neon-ui directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"
echo "Working directory: $(pwd)"

# Get the current database status
echo "Testing PostgreSQL connection..."
USER_NAME=$(whoami)
HAS_PG=0

# Check various connection methods
if psql -h localhost -p 5432 -U "$USER_NAME" -c '\l' postgres > /dev/null 2>&1; then
  echo "✅ Connected to PostgreSQL as: $USER_NAME"
  HAS_PG=1
  PG_USER="$USER_NAME"
  PG_PASS=""
elif psql -h localhost -p 5432 -U postgres -c '\l' postgres > /dev/null 2>&1; then
  echo "✅ Connected to PostgreSQL as: postgres (trust auth)"
  HAS_PG=1
  PG_USER="postgres"
  PG_PASS=""
elif PGPASSWORD=postgres psql -h localhost -p 5432 -U postgres -c '\l' postgres > /dev/null 2>&1; then
  echo "✅ Connected to PostgreSQL as: postgres (password auth)"
  HAS_PG=1
  PG_USER="postgres"
  PG_PASS="postgres"
else
  echo "❌ Could not connect to PostgreSQL with standard credentials."
fi

if [ $HAS_PG -eq 1 ]; then
  # Update connection settings with the working credentials
  echo "Updating connection parameters in API files..."
  
  # Update neonApi.js
  cat > src/api/neonApi.js.new << EOF
import axios from 'axios';

// Base URLs for different services
const PAGESERVER_API = '/api/pageserver';
const PG_CONNECTION = {
  host: 'localhost',
  port: 5432,
  user: '${PG_USER}',
  password: '${PG_PASS}',
  database: 'postgres'
};

// Create axios instance with timeout
const apiClient = axios.create({
  timeout: 5000 // 5 second timeout
});

// Rest of the original file...
EOF

  # Copy the rest of the original file
  tail -n +15 src/api/neonApi.js >> src/api/neonApi.js.new
  mv src/api/neonApi.js.new src/api/neonApi.js
  
  # Update postgres-server.js
  cat > postgres-server.js.new << EOF
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();
const port = 3081;

// Default PostgreSQL connection parameters
const PG_CONFIG = {
  host: 'localhost',
  port: 5432,
  user: '${PG_USER}',
  password: '${PG_PASS}',
  database: 'postgres'
};

// Rest of the original file...
EOF

  # Copy the rest of the original file
  tail -n +15 postgres-server.js >> postgres-server.js.new
  mv postgres-server.js.new postgres-server.js
  
  # Create some test databases
  echo ""
  echo "Creating test databases..."
  if [ -n "$PG_PASS" ]; then
    PGPASSWORD=$PG_PASS psql -h localhost -p 5432 -U $PG_USER -f test_db.sql postgres
  else
    psql -h localhost -p 5432 -U $PG_USER -f test_db.sql postgres
  fi
  
  echo ""
  echo "✅ Database connection and configuration updated!"
  echo "Existing databases should now appear in the UI."
  echo ""
  echo "Please restart the application to apply changes:"
  echo "1. Run ./run_here.sh from the neon-ui directory"
  echo "2. Or run ./run-ui.sh from the main neon directory"
  
else
  echo "❌ Could not establish a PostgreSQL connection."
  echo "Please install and configure PostgreSQL before proceeding."
  echo "On macOS, you can use: brew install postgresql@14 && brew services start postgresql@14"
  echo "Then create a database user with: createuser -s $USER_NAME"
fi 