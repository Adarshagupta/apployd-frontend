import { pageserverApi, computeApi, sqlApi } from './apiClient';
import axios from 'axios';

// Create an axios instance for API requests to our express server
const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Logger for debugging API calls
const logApiCall = (method, url, data = null) => {
  console.log(`🌐 API ${method}: ${url}`, data ? { data } : '');
};

// Add a request interceptor to include the auth token in all requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('neon_auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    logApiCall(config.method.toUpperCase(), config.url, config.data);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// API response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response (${response.config.url}):`, response.data);
    return response;
  },
  (error) => {
    // Log the error for debugging
    console.error('API Error:', error);
    console.error('Error details:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    });
    
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login if token is invalid
      localStorage.removeItem('neon_auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Get all tenants
export const getTenants = async () => {
  try {
    const response = await pageserverApi.get('/v1/tenant');
    return response.data;
  } catch (error) {
    console.error('Error fetching tenants:', error);
    // Return empty array instead of throwing
    return [];
  }
};

// Get timelines for a tenant
export const getTimelines = async (tenantId) => {
  try {
    const response = await pageserverApi.get(`/v1/tenant/${tenantId}/timeline`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching timelines for tenant ${tenantId}:`, error);
    // Return empty array instead of throwing
    return [];
  }
};

// Create a new timeline (branch)
export const createTimeline = async (tenantId, timelineId, pgVersion = 16, ancestorTimelineId = null) => {
  try {
    const data = {
      new_timeline_id: timelineId,
      pg_version: pgVersion,
    };
    
    if (ancestorTimelineId) {
      data.ancestor_timeline_id = ancestorTimelineId;
    }
    
    const response = await pageserverApi.post(`/v1/tenant/${tenantId}/timeline/`, data);
    return response.data;
  } catch (error) {
    console.error('Error creating timeline:', error);
    throw error;
  }
};

// Create a new database using the Neon compute API
export const createDatabase = async (dbName) => {
  console.log(`Creating database: ${dbName}`);
  
  try {
    if (!dbName || dbName.trim() === '') {
      throw new Error('Database name is required');
    }
    
    // Sanitize the database name to prevent injection
    const sanitizedDbName = dbName.replace(/[^a-zA-Z0-9_]/g, '_');
    
    try {
      // Try creating database via direct SQL first
      console.log('Creating database via direct SQL...');
      
      const directSqlResponse = await sqlApi.execute(
        `CREATE DATABASE ${sanitizedDbName};`, 
        [], // Empty params array
        {
          host: 'localhost',
          port: 55433,
          user: 'cloud_admin',
          password: 'cloud_admin',
          database: 'postgres'
        }
      );
      
      console.log('Database created via direct SQL:', directSqlResponse.data);
      
      return {
        success: true,
        message: `Database ${sanitizedDbName} created successfully`,
        database: sanitizedDbName,
        connection: {
          host: 'localhost',
          port: 55433,
          user: 'cloud_admin',
          database: sanitizedDbName
        },
        connectionString: `postgresql://cloud_admin:cloud_admin@localhost:55433/${sanitizedDbName}`,
        created: new Date().toISOString(),
        source: 'neon'
      };
    } catch (directSqlError) {
      console.error('Direct SQL creation failed:', directSqlError);
      
      if (directSqlError.response && directSqlError.response.status === 409) {
        throw new Error(`Database '${sanitizedDbName}' already exists. Please choose a different name.`);
      }
      
      throw new Error(directSqlError.response?.data?.message || 'Failed to create database. Backend services may not be running.');
    }
  } catch (error) {
    console.error('Error in createDatabase:', error);
    throw error;
  }
};

// Get list of all databases
export const getDatabases = async () => {
  try {
    // Call our API endpoint that returns databases for the current user
    const response = await apiClient.get('/databases');
    console.log('Databases fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching databases:', error);
    return [];
  }
};

// Helper to generate a connection string for Apployd DB
export const getConnectionString = (dbName = 'postgres', user = 'cloud_admin', port = 55433) => {
  if (port === 55433) {
    // Apployd DB database
    return `postgresql://${user}:cloud_admin@localhost:${port}/${dbName}`;
  } else {
    // Local database
    return `postgresql://${user}@localhost:${port}/${dbName}`;
  }
};

// Execute SQL on a specific database
export const executeSql = async (sql, connection = {}) => {
  try {
    const defaultConnection = {
      host: 'localhost',
      port: 55433,
      user: 'cloud_admin',
      password: 'cloud_admin',
      database: 'postgres'
    };
    
    const sqlResponse = await sqlApi.execute(
      sql,
      [], // Empty params array
      { ...defaultConnection, ...connection }
    );
    return sqlResponse.data;
  } catch (error) {
    console.error('Error executing SQL:', error);
    throw error;
  }
};

// Helper to generate a UUID (simplified version)
export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Database management API
export const neonApi = {
  // Get all databases for the current user
  getDatabases: async () => {
    try {
      const response = await apiClient.get('/databases');
      return response.data;
    } catch (error) {
      console.error('Error fetching databases:', error);
      return [];
    }
  },

  // Create a new database for the current user
  createDatabase: async (dbName) => {
    try {
      const response = await apiClient.post('/databases', { name: dbName });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Delete a database
  deleteDatabase: async (dbId) => {
    try {
      const response = await apiClient.delete(`/databases/${dbId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get connection details for a database
  getDatabaseConnection: async (dbId) => {
    try {
      const response = await apiClient.get(`/databases/${dbId}/connection`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Execute SQL on a specific database
  executeSQL: async (sql, connection) => {
    try {
      console.log(`Executing SQL: ${sql}`);
      console.log(`Connection: ${JSON.stringify(connection)}`);
      
      const response = await apiClient.post('/direct-sql', { 
        query: sql, 
        params: [],
        ...connection 
      });
      
      if (response.data && response.data.success === false) {
        console.error('SQL execution failed:', response.data.message);
        throw new Error(response.data.message || 'SQL execution failed');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error executing SQL:', error);
      // Rethrow with a more helpful message
      if (error.response?.data?.message) {
        throw new Error(`Database error: ${error.response.data.message}`);
      } else if (error.message.includes('ECONNREFUSED')) {
        throw new Error(`Could not connect to database at ${connection.host}:${connection.port}`);
      } else {
        throw handleApiError(error);
      }
    }
  },

  // Get database metrics
  getDatabaseMetrics: async (dbId) => {
    try {
      const response = await apiClient.get(`/databases/${dbId}/metrics`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get user usage statistics
  getUserUsageStats: async () => {
    try {
      const response = await apiClient.get('/user/usage');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Create a database backup
  createBackup: async (dbId) => {
    try {
      const response = await apiClient.post(`/databases/${dbId}/backups`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get database backups
  getBackups: async (dbId) => {
    try {
      const response = await apiClient.get(`/databases/${dbId}/backups`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Restore from backup
  restoreFromBackup: async (dbId, backupId) => {
    try {
      const response = await apiClient.post(`/databases/${dbId}/backups/${backupId}/restore`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Refresh the database list
  refreshDatabases: async () => {
    try {
      const response = await apiClient.get('/databases/refresh');
      return response.data;
    } catch (error) {
      console.error('Error refreshing databases:', error);
      throw error;
    }
  }
};

// Helper function to handle API errors
const handleApiError = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const errorMessage = error.response.data.message || 'Something went wrong';
    return new Error(errorMessage);
  } else if (error.request) {
    // The request was made but no response was received
    return new Error('No response from server. Please check your connection');
  } else {
    // Something happened in setting up the request that triggered an Error
    return new Error('Error setting up request. Please try again later');
  }
};

// Export method for the main API object as well
export default neonApi;
