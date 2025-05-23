const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const app = express();
const port = 3081;

// Import the email handler
const { sendEmailHandler } = require('./src/server/api/email');

// Default PostgreSQL connection parameters
const PG_CONFIG = {
  host: 'localhost',
  port: 5432,
  user: 'prazwolgupta',
  password: '',
  database: 'postgres'
};

// Use local PostgreSQL for auth database
const AUTH_DB_CONFIG = {
  host: 'localhost',
  port: 5432,
  user: 'prazwolgupta',
  password: '',
  database: 'postgres'
};

// Apployd DB cloud configuration
const NEON_CLOUD_CONFIG = {
  host: 'localhost',
  port: 5432,
  user: 'prazwolgupta',
  password: '',
  database: 'postgres'
};

// Apployd DB PostgreSQL configuration
const NEON_PG_CONFIG = {
  host: 'localhost',
  port: 55433,
  user: 'cloud_admin',
  password: 'cloud_admin',
  database: 'postgres'
};

// JWT Secret (should be in env variables in production)
const JWT_SECRET = 'neon-secret-key-for-development-only';

app.use(express.json());
app.use(cors());

// Function to initialize the auth database and create tables if needed
const initializeAuthDatabase = async () => {
  try {
    console.log('📊 Checking Neon PostgreSQL databases...');
    
    const authPool = new Pool(AUTH_DB_CONFIG);
    
    // Check if users table exists, create it if it doesn't
    try {
      // First check if the users table exists
      const checkUsersTable = await authPool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'users'
        );
      `);
      
      if (!checkUsersTable.rows[0].exists) {
        console.log('Creating users table...');
        await authPool.query(`
          CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            first_name VARCHAR(100) NOT NULL,
            last_name VARCHAR(100) NOT NULL,
            company_name VARCHAR(255),
            roles TEXT[] DEFAULT '{"user"}',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `);
      }
    } catch (err) {
      console.error('Error checking/creating users table:', err);
    }
    
    // Check if databases table exists, create it if it doesn't
    try {
      const checkDatabasesTable = await authPool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'databases'
        );
      `);
      
      if (!checkDatabasesTable.rows[0].exists) {
        console.log('Creating databases table...');
        await authPool.query(`
          CREATE TABLE IF NOT EXISTS databases (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            name VARCHAR(255) UNIQUE NOT NULL,
            host VARCHAR(255) NOT NULL DEFAULT 'localhost',
            port INTEGER NOT NULL DEFAULT 5432,
            username VARCHAR(100) NOT NULL,
            password VARCHAR(255),
            source VARCHAR(50) DEFAULT 'local',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `);
      }
    } catch (err) {
      console.error('Error checking/creating databases table:', err);
    }
    
    // Check if we need to seed initial admin user
    try {
      const userCount = await authPool.query('SELECT COUNT(*) FROM users');
      
      if (parseInt(userCount.rows[0].count) === 0) {
        console.log('🌱 Seeding initial admin user...');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        await authPool.query(`
          INSERT INTO users (email, password_hash, first_name, last_name, company_name, roles)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, ['admin@neondb.io', hashedPassword, 'Admin', 'User', 'Neon', ['admin', 'developer']]);
        
        console.log('✅ Created initial admin user (admin@neondb.io / admin123)');
      }
    } catch (err) {
      console.error('Error checking/seeding admin user:', err);
    }
    
    // Get registered database count
    try {
      const dbResult = await authPool.query('SELECT COUNT(*) FROM databases');
      console.log(`Found ${dbResult.rows[0].count} Neon databases`);
    } catch (err) {
      console.error('Error counting databases:', err);
    }
    
    await authPool.end();
    return true;
  } catch (error) {
    console.error('❌ Error initializing auth database:', error);
    console.warn('⚠️ Falling back to in-memory data storage');
    return false;
  }
};

// Initialize the auth database
initializeAuthDatabase();

// Function to synchronize in-memory database list with actual PostgreSQL databases
const syncDatabasesWithPostgres = async () => {
  console.log('🔄 Synchronizing database registry with PostgreSQL instances...');
  let authPool;
  
  try {
    authPool = new Pool(AUTH_DB_CONFIG);
    
    // Connect to local PostgreSQL
    console.log('📊 Checking local PostgreSQL databases...');
    const localPool = new Pool({
      host: PG_CONFIG.host,
      port: PG_CONFIG.port,
      user: PG_CONFIG.user,
      password: PG_CONFIG.password,
      database: 'postgres',
    });
    
    // Get all databases except system ones
    const result = await localPool.query(`
      SELECT datname FROM pg_database 
      WHERE datistemplate = false 
      AND datname NOT IN ('postgres', 'template0', 'template1')
    `);
    
    console.log(`Found ${result.rows.length} local databases`);
    
    // For each database, ensure it's in our registry
    for (const db of result.rows) {
      const dbName = db.datname;
      
      // Check if this database is already registered
      const dbCheck = await authPool.query(
        'SELECT * FROM databases WHERE name = $1 AND port = $2',
        [dbName, PG_CONFIG.port]
      );
      
      if (dbCheck.rows.length === 0) {
        // Add to admin's databases (user_id 1 is the admin)
        try {
          await authPool.query(
            `INSERT INTO databases (user_id, name, host, port, username, password, source)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [1, dbName, PG_CONFIG.host, PG_CONFIG.port, PG_CONFIG.user, PG_CONFIG.password, 'local']
          );
          console.log(`➕ Added existing local database to registry: ${dbName}`);
        } catch (err) {
          console.error(`Error registering database ${dbName}:`, err);
        }
      }
    }
    
    await localPool.end();
    console.log('✅ Local PostgreSQL synchronization complete');
  } catch (localErr) {
    console.error('❌ Error synchronizing with local PostgreSQL:', localErr);
  } finally {
    if (authPool) {
      await authPool.end();
    }
  }
};

// Call synchronization on startup
syncDatabasesWithPostgres().catch(err => {
  console.error('Error during initial database synchronization:', err);
});

// Generate JWT token for authentication
const generateToken = (user) => {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '24h' });
};

// Middleware to authenticate requests
const authenticate = async (req, res, next) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Connect to database to get the user
    const authPool = new Pool(AUTH_DB_CONFIG);
    
    // Find user by id from token
    const userResult = await authPool.query(
      'SELECT * FROM users WHERE id = $1',
      [decoded.id]
    );
    
    await authPool.end();
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Attach user to request object
    req.user = userResult.rows[0];
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Authentication endpoints
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  
  try {
    // Connect to auth database
    const authPool = new Pool(AUTH_DB_CONFIG);
    
    // Find user by email
    const userResult = await authPool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (userResult.rows.length === 0) {
      await authPool.end();
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    const user = userResult.rows[0];
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      await authPool.end();
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Generate token
    const token = generateToken({
      id: user.id.toString(),
      email: user.email,
      roles: user.roles
    });
    
    // Return user info (without password) and token
    const { password_hash: _, ...userWithoutPassword } = user;
    
    await authPool.end();
    res.json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const { firstName, lastName, email, password, companyName } = req.body;
  
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  try {
    // Connect to auth database
    const authPool = new Pool(AUTH_DB_CONFIG);
    
    // Check if user already exists
    const existingUser = await authPool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      await authPool.end();
      return res.status(409).json({ message: 'Email already registered' });
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const newUserResult = await authPool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, company_name, roles)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [email, hashedPassword, firstName, lastName, companyName || '', ['user']]
    );
    
    const newUser = newUserResult.rows[0];
    
    // Generate token
    const token = generateToken({
      id: newUser.id.toString(),
      email: newUser.email,
      roles: newUser.roles
    });
    
    // Return user info (without password) and token
    const { password_hash: _, ...userWithoutPassword } = newUser;
    
    await authPool.end();
    res.status(201).json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Add verify-token endpoint
app.get('/api/auth/verify-token', authenticate, (req, res) => {
  res.json({ valid: true });
});

app.get('/api/auth/me', authenticate, (req, res) => {
  // Return user info (without password)
  const { password_hash: _, ...userWithoutPassword } = req.user;
  res.json(userWithoutPassword);
});

// Database management endpoints
app.get('/api/databases', authenticate, async (req, res) => {
  try {
    // Connect to auth database
    const authPool = new Pool(AUTH_DB_CONFIG);
    
    try {
      // Return only databases owned by the current user or admin
      let query = 'SELECT * FROM databases WHERE user_id = $1';
      let params = [req.user.id];
      
      // Admin can see all databases
      if (req.user.roles.includes('admin')) {
        query = 'SELECT * FROM databases';
        params = [];
      }
      
      const result = await authPool.query(query, params);
      res.json(result.rows);
    } catch (queryError) {
      console.error('Error querying databases:', queryError);
      // Return empty array instead of error
      res.json([]);
    } finally {
      try {
        await authPool.end();
      } catch (poolError) {
        console.warn('Error closing auth pool:', poolError);
      }
    }
  } catch (error) {
    console.error('Error fetching databases:', error);
    // Return empty array instead of error
    res.json([]);
  }
});

app.post('/api/databases', authenticate, async (req, res) => {
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ message: 'Database name is required' });
  }
  
  // Check if database name is valid
  if (!/^[a-zA-Z0-9_]+$/.test(name)) {
    return res.status(400).json({ 
      message: 'Database name can only contain letters, numbers, and underscores' 
    });
  }
  
  try {
    // Connect to auth database
    const authPool = new Pool(AUTH_DB_CONFIG);
    
    // Check if database already exists in registry
    const dbCheck = await authPool.query(
      'SELECT * FROM databases WHERE name = $1', 
      [name]
    );
    
    if (dbCheck.rows.length > 0) {
      await authPool.end();
      return res.status(409).json({ 
        message: 'Database with this name already exists' 
      });
    }
    
    // Connect to the local PostgreSQL to create the database
    const pgPool = new Pool({
      host: PG_CONFIG.host,
      port: PG_CONFIG.port,
      user: PG_CONFIG.user,
      password: PG_CONFIG.password,
      database: 'postgres' // Connect to default db to create new ones
    });
    
    try {
      // Check if database already exists in PostgreSQL
      const pgDbCheck = await pgPool.query(
        "SELECT 1 FROM pg_database WHERE datname = $1",
        [name]
      );
      
      if (pgDbCheck.rows.length > 0) {
        await pgPool.end();
        await authPool.end();
        return res.status(409).json({
          message: `Database '${name}' already exists in PostgreSQL. Please choose a different name.`,
          error_code: 'DATABASE_EXISTS'
        });
      }
      
      // Create the actual database in PostgreSQL
      await pgPool.query(`CREATE DATABASE ${name}`);
      console.log(`Database '${name}' created successfully in PostgreSQL`);
      
      // Add to user's databases in auth registry AFTER successfully creating it
      const newDbResult = await authPool.query(
        `INSERT INTO databases (user_id, name, host, port, username, password, source)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [req.user.id, name, PG_CONFIG.host, PG_CONFIG.port, PG_CONFIG.user, PG_CONFIG.password, 'local']
      );
      
      await pgPool.end();
      await authPool.end();
      
      // Return the new database
      res.status(201).json(newDbResult.rows[0]);
    } catch (pgErr) {
      console.error('Error creating database in PostgreSQL:', pgErr);
      await pgPool.end();
      await authPool.end();
      
      return res.status(500).json({
        message: `Failed to create database in PostgreSQL: ${pgErr.message}`,
        error_code: 'DATABASE_CREATE_FAILED'
      });
    }
  } catch (err) {
    console.error('Error in database creation process:', err);
    
    return res.status(500).json({
      message: `Failed to create database: ${err.message}`,
      details: {
        error: err.message
      }
    });
  }
});

app.delete('/api/databases/:id', authenticate, async (req, res) => {
  const dbId = req.params.id;
  
  try {
    // Connect to cloud database
    const cloudPool = new Pool(NEON_CLOUD_CONFIG);
    
    // Find the database
    let query = 'SELECT * FROM databases WHERE id = $1 AND user_id = $2';
    let params = [dbId, req.user.id];
    
    // Admin can delete any database
    if (req.user.roles.includes('admin')) {
      query = 'SELECT * FROM databases WHERE id = $1';
      params = [dbId];
    }
    
    const dbResult = await cloudPool.query(query, params);
    
    if (dbResult.rows.length === 0) {
      await cloudPool.end();
      return res.status(404).json({ message: 'Database not found' });
    }
    
    const db = dbResult.rows[0];
    
    try {
      // Connect to the appropriate PostgreSQL instance based on source
      const isNeon = db.source === 'neon' || db.port === NEON_PG_CONFIG.port;
      const pool = new Pool({
        host: isNeon ? NEON_PG_CONFIG.host : PG_CONFIG.host,
        port: isNeon ? NEON_PG_CONFIG.port : PG_CONFIG.port,
        user: isNeon ? NEON_PG_CONFIG.user : PG_CONFIG.user,
        password: isNeon ? NEON_PG_CONFIG.password : PG_CONFIG.password,
        database: 'postgres', // Always connect to postgres db to drop other databases
      });
      
      // Drop the database
      await pool.query(`DROP DATABASE IF EXISTS ${db.name}`);
      console.log(`Database '${db.name}' dropped successfully from ${isNeon ? 'Neon' : 'local'} PostgreSQL`);
      
      // Clean up
      await pool.end();
    } catch (dropErr) {
      console.error(`Error dropping database ${db.name}:`, dropErr);
      // Continue with removal from registry even if drop fails
    }
    
    // Remove from databases registry
    await cloudPool.query('DELETE FROM databases WHERE id = $1', [dbId]);
    await cloudPool.end();
    
    // Return success
    res.json({ message: `Database '${db.name}' deleted successfully` });
  } catch (err) {
    console.error('Error deleting database:', err);
    
    return res.status(500).json({
      message: `Failed to delete database: ${err.message}`
    });
  }
});

app.get('/api/databases/:id/connection', authenticate, async (req, res) => {
  const dbId = req.params.id;
  
  try {
    // Connect to cloud database
    const cloudPool = new Pool(NEON_CLOUD_CONFIG);
    
    // Find the database
    let query = 'SELECT * FROM databases WHERE id = $1 AND user_id = $2';
    let params = [dbId, req.user.id];
    
    // Admin can see any database connection
    if (req.user.roles.includes('admin')) {
      query = 'SELECT * FROM databases WHERE id = $1';
      params = [dbId];
    }
    
    const dbResult = await cloudPool.query(query, params);
    
    if (dbResult.rows.length === 0) {
      await cloudPool.end();
      return res.status(404).json({ message: 'Database not found' });
    }
    
    const db = dbResult.rows[0];
    await cloudPool.end();
    
    // Return connection details
    res.json({
      connection: {
        host: db.host,
        port: db.port,
        user: db.username,
        password: db.password,
        database: db.name
      },
      connectionString: `postgresql://${db.username}:${db.password}@${db.host}:${db.port}/${db.name}`
    });
  } catch (err) {
    console.error('Error getting database connection:', err);
    
    return res.status(500).json({
      message: `Failed to get database connection: ${err.message}`
    });
  }
});

// Handle SQL execution requests
app.post('/api/execute-sql', authenticate, async (req, res) => {
  const { sql, connection } = req.body;
  
  if (!sql) {
    return res.status(400).json({
      success: false,
      message: 'SQL query is required'
    });
  }
  
  // Verify the connection belongs to one of the user's databases or admin
  if (!req.user.roles.includes('admin')) {
    const userDb = userDatabases.find(
      db => db.userId === req.user.id && 
      db.connection.database === connection.database
    );
    
    if (!userDb) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this database'
      });
    }
  }
  
  // Log the incoming request
  console.log(`User ${req.user.id} executing SQL: ${sql}`);
  console.log('Connection info:', connection);
  
  try {
    // Connect to the specified database
    const pool = new Pool({
      host: connection.host || PG_CONFIG.host,
      port: connection.port || PG_CONFIG.port,
      user: connection.user || PG_CONFIG.user,
      password: connection.password || PG_CONFIG.password,
      database: connection.database,
    });
    
    // Execute the query
    const result = await pool.query(sql);
    
    return res.json({
      success: true,
      command: result.command,
      rowCount: result.rowCount,
      rows: result.rows,
      fields: result.fields ? result.fields.map(f => ({
        name: f.name,
        dataTypeID: f.dataTypeID
      })) : []
    });
  } catch (err) {
    console.error('Error executing SQL:', err);
    
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
});

// Direct SQL execution endpoint - allows working with both local and Neon databases
app.post('/api/direct-sql', async (req, res) => {
  const { query, params, host, port, user, password, database } = req.body;
  
  // Use either query from new format or command from old format for backwards compatibility
  const sql = query || req.body.query || req.body.command || req.body.sql;
  const parameters = params || [];
  
  if (!sql) {
    return res.status(400).json({
      success: false,
      message: 'SQL query is required'
    });
  }
  
  // Log the incoming request
  console.log(`Executing direct SQL command: ${sql}`);
  console.log(`Connection: ${host || 'localhost'}:${port || 5432} (${user || 'prazwolgupta'}@${database || 'postgres'})`);
  
  try {
    // Set up connection parameters with defaults
    const connParams = {
      host: host || 'localhost',
      port: port || 5432,
      user: user || 'prazwolgupta',
      password: password || '',
      database: database || 'postgres',
    };
    
    const pool = new Pool(connParams);
    
    try {
      // Execute the SQL command with parameters
      const result = await pool.query(sql, parameters);
      
      return res.json({
        success: true,
        message: `SQL executed successfully. Rows affected: ${result.rowCount || 0}`,
        rows_affected: result.rowCount || 0,
        rows: result.rows,
        fields: result.fields,
        command: result.command
      });
    } catch (err) {
      console.error('Error executing SQL:', err);
      
      return res.status(500).json({
        success: false,
        message: `SQL execution failed: ${err.message}`,
        error: err.message
      });
    } finally {
      await pool.end();
    }
  } catch (err) {
    console.error('Unexpected error:', err);
    
    return res.status(500).json({
      success: false,
      message: `Unexpected error: ${err.message}`,
      error: err.message
    });
  }
});

// Sync all existing databases - non-authenticated for development purposes
app.get('/api/sync-databases', async (req, res) => {
  try {
    const databases = await syncDatabasesWithPostgres();
    res.json({ 
      success: true, 
      message: 'Database synchronization completed successfully',
      count: databases.length,
      databases: databases
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Database synchronization failed: ${err.message}`,
      error: err.message
    });
  }
});

// User metrics and usage statistics
app.get('/api/user/usage', authenticate, async (req, res) => {
  try {
    // Connect to cloud database
    const cloudPool = new Pool(NEON_CLOUD_CONFIG);
    
    // Get databases for the user
    let userDbs = [];
    try {
      const dbResult = await cloudPool.query(
        'SELECT * FROM databases WHERE user_id = $1',
        [req.user.id]
      );
      userDbs = dbResult.rows;
    } catch (dbError) {
      console.warn('Error fetching user databases:', dbError);
      // Continue with empty database list
    } finally {
      try {
        await cloudPool.end();
      } catch (poolError) {
        console.warn('Error closing cloud pool:', poolError);
      }
    }
    
    // In a real implementation, you would query actual usage metrics
    // This is just a placeholder with synthetic data
    res.json({
      databases: {
        count: userDbs.length,
        limit: req.user.roles.includes('admin') ? 100 : 10,
        usage: userDbs.length * 100 // MB
      },
      storage: {
        used: userDbs.length * 100, // MB
        limit: req.user.roles.includes('admin') ? 100000 : 5000 // MB
      },
      compute: {
        hours: Math.floor(Math.random() * 10),
        limit: req.user.roles.includes('admin') ? 1000 : 100
      },
      currentPlan: req.user.roles.includes('admin') ? 'Enterprise' : 'Free'
    });
  } catch (error) {
    console.error('Error fetching user usage:', error);
    // Return fallback data instead of error
    res.json({
      databases: {
        count: 0,
        limit: req.user.roles.includes('admin') ? 100 : 10,
        usage: 0
      },
      storage: {
        used: 0,
        limit: req.user.roles.includes('admin') ? 100000 : 5000
      },
      compute: {
        hours: 0,
        limit: req.user.roles.includes('admin') ? 1000 : 100
      },
      currentPlan: req.user.roles.includes('admin') ? 'Enterprise' : 'Free'
    });
  }
});

// Handle backups
app.post('/api/databases/:id/backups', authenticate, (req, res) => {
  const dbId = req.params.id;
  
  // Find the database
  const db = userDatabases.find(
    db => db.id === dbId && db.userId === req.user.id
  );
  
  if (!db) {
    return res.status(404).json({ message: 'Database not found' });
  }
  
  // In a real implementation, you would initiate a backup process
  // For now, just return a success message with synthetic data
  res.json({
    id: Math.floor(Math.random() * 10000).toString(),
    databaseId: db.id,
    createdAt: new Date().toISOString(),
    status: 'completed',
    size: Math.floor(Math.random() * 100) + 'MB',
    message: `Backup created for database '${db.name}'`
  });
});

app.get('/api/databases/:id/backups', authenticate, (req, res) => {
  const dbId = req.params.id;
  
  // Find the database
  const db = userDatabases.find(
    db => db.id === dbId && db.userId === req.user.id
  );
  
  if (!db) {
    return res.status(404).json({ message: 'Database not found' });
  }
  
  // In a real implementation, you would query actual backups
  // For now, just return synthetic data
  res.json([
    {
      id: '1',
      databaseId: db.id,
      createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      status: 'completed',
      size: Math.floor(Math.random() * 100) + 'MB'
    },
    {
      id: '2',
      databaseId: db.id,
      createdAt: new Date().toISOString(), // now
      status: 'completed',
      size: Math.floor(Math.random() * 100) + 'MB'
    }
  ]);
});

// Email endpoint
app.post('/api/email/send', async (req, res) => {
  // Pass the request to the email handler
  return sendEmailHandler(req, res);
});

// Start the server
app.listen(port, () => {
  console.log(`PostgreSQL API server running at http://localhost:${port}`);
  console.log(`Using database: postgresql://${PG_CONFIG.user}:xxxxx@${PG_CONFIG.host}:${PG_CONFIG.port}/${PG_CONFIG.database}`);
  console.log('Ready to execute SQL commands!');
});
