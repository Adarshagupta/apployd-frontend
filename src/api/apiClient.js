import axios from 'axios';

// Configuration for different environments
export const API_CONFIG = {
  // Base URLs for different services
  baseUrls: {
    // Direct SQL execution endpoint for PostgreSQL queries
    sql: '/api/direct-sql',
    
    // Apployd DB backend services
    pageserver: '/api/pageserver',
    compute: '/api/compute',
    safekeeper: '/api/safekeeper',
    broker: '/api/broker'
  },
  
  // API timeout in milliseconds
  timeout: 10000
};

console.log('API Configuration:', API_CONFIG);

// Create main axios instance with common configuration
const axiosInstance = axios.create({
  timeout: API_CONFIG.timeout, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Authentication token setup
export const setAuthTokens = (token) => {
  if (token) {
    // Set the auth token for all our API clients
    pageserverApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    computeApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    safekeeperApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    brokerApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('Auth tokens set for all services');
  } else {
    // Clear auth tokens
    delete pageserverApi.defaults.headers.common['Authorization'];
    delete computeApi.defaults.headers.common['Authorization'];
    delete safekeeperApi.defaults.headers.common['Authorization'];
    delete brokerApi.defaults.headers.common['Authorization'];
    console.log('Auth tokens cleared for all services');
  }
};

// Request interceptor for adding auth tokens, logging, etc.
axiosInstance.interceptors.request.use(
  (config) => {
    // Log outgoing requests in development
    console.debug(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling common error scenarios
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle API error responses
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data;
      
      console.error(`API Error ${status}: ${typeof data === 'object' ? JSON.stringify(data) : data}`);
      
      if (status === 401 || status === 403) {
        console.warn('Authentication required');
      } else if (status === 404) {
        console.warn('Resource not found');
      } else if (status >= 500) {
        console.error('Server error occurred');
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Create specialized API instances for different services
export const pageserverApi = axios.create({
  baseURL: API_CONFIG.baseUrls.pageserver,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

export const computeApi = axios.create({
  baseURL: API_CONFIG.baseUrls.compute,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

export const safekeeperApi = axios.create({
  baseURL: API_CONFIG.baseUrls.safekeeper,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

export const brokerApi = axios.create({
  baseURL: API_CONFIG.baseUrls.broker,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// SQL API for direct PostgreSQL queries
export const sqlApi = {
  execute: async (query, params = [], connection = {}) => {
    try {
      // Direct execution of SQL using the direct-sql endpoint
      const response = await axios.post(API_CONFIG.baseUrls.sql, { 
        query, 
        params,
        ...connection 
      });
      return response;
    } catch (error) {
      console.error('SQL API error:', error);
      throw error;
    }
  }
};

// Monitoring API - specialized for gathering metrics and status
export const monitoringApi = {
  // Get system status from all components
  getSystemStatus: async () => {
    try {
      // Attempt to get status from all services in parallel
      const [pageserverStatus, computeStatus, safekeeperStatus, brokerStatus] = await Promise.allSettled([
        pageserverApi.get('/v1/status'),
        computeApi.get('/status'),
        safekeeperApi.get('/v1/metrics'),
        brokerApi.get('/metrics')
      ]);
      
      return {
        pageserver: pageserverStatus.status === 'fulfilled' ? { status: 'online', ...pageserverStatus.value.data } : { status: 'error', error: 'Service unavailable' },
        compute: computeStatus.status === 'fulfilled' ? { status: 'online', ...computeStatus.value.data } : { status: 'error', error: 'Service unavailable' },
        safekeeper: safekeeperStatus.status === 'fulfilled' ? { status: 'online', metrics: safekeeperStatus.value.data } : { status: 'error', error: 'Service unavailable' },
        broker: brokerStatus.status === 'fulfilled' ? { status: 'online', metrics: brokerStatus.value.data } : { status: 'error', error: 'Service unavailable' }
      };
    } catch (error) {
      console.error('Error getting system status:', error);
      throw error;
    }
  },
  
  // Get pageserver metrics
  getPageserverMetrics: async () => {
    return pageserverApi.get('/v1/metrics');
  },
  
  // Get safekeeper metrics
  getSafekeeperMetrics: async () => {
    return safekeeperApi.get('/v1/metrics');
  },
  
  // Get compute node metrics
  getComputeMetrics: async () => {
    return computeApi.get('/v1/metrics');
  },
  
  // Get storage broker metrics
  getBrokerMetrics: async () => {
    return brokerApi.get('/metrics');
  }
};

// Settings API - for configuration
export const settingsApi = {
  // Get pageserver configuration
  getPageserverConfig: async () => {
    return pageserverApi.get('/v1/config');
  },
  
  // Get tenant configuration
  getTenantConfig: async (tenantId) => {
    return pageserverApi.get(`/v1/tenant/${tenantId}/config`);
  },
  
  // Update tenant configuration
  updateTenantConfig: async (tenantId, configData) => {
    return pageserverApi.put(`/v1/tenant/${tenantId}/config`, configData);
  },
  
  // Get compute node configuration
  getComputeConfig: async () => {
    return computeApi.get('/v1/config');
  },
  
  // Update compute node configuration
  updateComputeConfig: async (configData) => {
    return computeApi.put('/v1/config', configData);
  }
};

// Experimental API - for advanced/experimental features
export const experimentalApi = {
  // Timeline import
  importTimeline: async (tenantId, timelineId, importData) => {
    return pageserverApi.post(`/v1/tenant/${tenantId}/timeline/${timelineId}/import`, importData);
  },
  
  // Tenant attachment
  attachTenant: async (tenantId, attachData) => {
    return pageserverApi.put(`/v1/tenant/${tenantId}/attach`, attachData);
  },
  
  // WAL inspection
  inspectWAL: async (tenantId, timelineId, lsn) => {
    return pageserverApi.get(`/v1/tenant/${tenantId}/timeline/${timelineId}/wal?lsn=${lsn}`);
  }
};

// Export default API for backwards compatibility
export default {
  sql: sqlApi,
  monitoring: monitoringApi,
  settings: settingsApi,
  experimental: experimentalApi
}; 