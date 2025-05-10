/**
 * Connectivity check script for Neon UI
 * This script verifies connections to all backend services
 */

const axios = require('axios');
const { Pool } = require('pg');
const chalk = require('chalk');

// Configuration for services to check
const SERVICES = [
  {
    name: 'PostgreSQL Local Server',
    type: 'postgres',
    config: {
      host: 'localhost',
      port: 5432,
      user: 'prazwolgupta',
      password: '',
      database: 'postgres'
    }
  },
  {
    name: 'PostgreSQL Neon Server',
    type: 'postgres',
    config: {
      host: 'localhost',
      port: 55433,
      user: 'cloud_admin',
      password: 'cloud_admin',
      database: 'postgres'
    }
  },
  {
    name: 'Pageserver API',
    type: 'http',
    url: 'http://localhost:9898/v1/status',
    expectedStatus: 200
  },
  {
    name: 'Compute API',
    type: 'http',
    url: 'http://localhost:3080/status',
    expectedStatus: 200
  },
  {
    name: 'Safekeeper API',
    type: 'http',
    url: 'http://localhost:7676/v1/metrics',
    expectedStatus: 200
  },
  {
    name: 'Storage Broker API',
    type: 'http',
    url: 'http://localhost:50051/metrics',
    expectedStatus: 200
  },
  {
    name: 'PostgreSQL API Server',
    type: 'http',
    url: 'http://localhost:3081/api/databases',
    expectedStatus: 200
  }
];

// Helper functions for checking different service types
const checkPostgres = async (service) => {
  try {
    const pool = new Pool({
      host: service.config.host,
      port: service.config.port,
      user: service.config.user,
      password: service.config.password,
      database: service.config.database,
      // Short timeout to fail fast
      connectionTimeoutMillis: 3000
    });
    
    // Try a simple query
    const result = await pool.query('SELECT 1 as connected');
    await pool.end();
    
    return {
      success: result.rows[0].connected === 1,
      message: 'Connected successfully'
    };
  } catch (error) {
    return {
      success: false,
      message: `Connection failed: ${error.message}`
    };
  }
};

const checkHttp = async (service) => {
  try {
    const response = await axios.get(service.url, {
      timeout: 3000,
      validateStatus: (status) => true // Accept any status
    });
    
    const success = service.expectedStatus 
      ? response.status === service.expectedStatus
      : response.status >= 200 && response.status < 300;
    
    return {
      success,
      message: `Status: ${response.status} ${response.statusText || ''}`
    };
  } catch (error) {
    return {
      success: false,
      message: `Request failed: ${error.message}`
    };
  }
};

// Main function to check all services
const checkAllServices = async () => {
  console.log(chalk.blue.bold('\n=== Neon UI Connectivity Check ===\n'));
  
  let allGood = true;
  
  for (const service of SERVICES) {
    process.stdout.write(`Checking ${chalk.cyan(service.name)}... `);
    
    const result = service.type === 'postgres' 
      ? await checkPostgres(service)
      : await checkHttp(service);
    
    if (result.success) {
      console.log(chalk.green('✓'), chalk.green(result.message));
    } else {
      console.log(chalk.red('✗'), chalk.red(result.message));
      allGood = false;
    }
  }
  
  console.log('\n=== Summary ===');
  if (allGood) {
    console.log(chalk.green.bold('All services are available! 🎉'));
  } else {
    console.log(chalk.yellow.bold('Some services are not available. Check the logs above for details.'));
  }
  
  return allGood;
};

// Run the check
checkAllServices()
  .then(allGood => {
    process.exit(allGood ? 0 : 1);
  })
  .catch(error => {
    console.error(chalk.red('Error running connectivity check:'), error);
    process.exit(1);
  }); 