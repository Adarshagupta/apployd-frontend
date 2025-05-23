import axios from 'axios';

// Create an axios instance for auth requests
const authAxios = axios.create({
  baseURL: '/api/auth',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Function to get CSRF token from cookies
const getCsrfToken = () => {
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1];
  return cookieValue || '';
};

// Add a request interceptor to include the auth token in all requests
authAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('neon_auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Add CSRF token to headers for non-GET requests
    if (config.method !== 'get') {
      const csrfToken = getCsrfToken();
      if (csrfToken) {
        config.headers['X-CSRF-TOKEN'] = csrfToken;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration
authAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 and we haven't tried refreshing the token yet
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('neon_refresh_token');
        
        if (refreshToken) {
          // Create a new axios instance for refresh request to avoid interceptors loop
          const refreshResponse = await axios.post('/api/auth/refresh-token', {
            refreshToken
          });
          
          const { token, refreshToken: newRefreshToken } = refreshResponse.data;
          
          // Store the new tokens
          localStorage.setItem('neon_auth_token', token);
          localStorage.setItem('neon_refresh_token', newRefreshToken);
          
          // Update the original request with the new token
          authAxios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          
          // Retry the original request
          return authAxios(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Token refresh failed, clear tokens and redirect to login
      localStorage.removeItem('neon_auth_token');
        localStorage.removeItem('neon_refresh_token');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API service
export const authApi = {
  // Login with email and password
  login: async (email, password) => {
    try {
      console.log('Attempting to login user:', { email, password: '[REDACTED]' });
      
      const response = await authAxios.post('/login', { email, password });
      console.log('Login successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Login error details:', error);
      
      // Log more detailed information about the error
      if (error.response) {
        console.error('Server responded with:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        });
        
        // If we get a 500 error from the server, we could implement a fallback for testing
        if (error.response.status === 500 && (process.env.NODE_ENV === 'development' || window.isDevEnvironment)) {
          console.warn('Using mock login as fallback in development environment');
          
          // This is just for development/testing when the backend is not available
          // In production, you should never do this and let the real error propagate
          const mockResponse = {
            user: {
              id: 'mock-user-' + Math.random().toString(36).substring(2, 15),
              firstName: 'Test',
              lastName: 'User',
              email: email,
              companyName: 'Neon',
              roles: ['user'],
              emailVerified: false
            },
            token: 'mock-jwt-token-' + Math.random().toString(36).substring(2, 15)
          };
          
          console.log('Created mock login response:', mockResponse);
          return mockResponse;
        }
      }
      
      throw handleApiError(error);
    }
  },

  // Register a new user
  register: async (userData) => {
    try {
      console.log('Attempting to register user with data:', {
        ...userData,
        password: '[REDACTED]', // Don't log the actual password
      });
      
      const response = await authAxios.post('/register', userData);
      console.log('Registration successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Registration error details:', error);
      
      // Log more detailed information about the error
      if (error.response) {
        console.error('Server responded with:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        });
        
        // If we get a 500 error from the server, we could implement a fallback for testing
        if (error.response.status === 500 && (process.env.NODE_ENV === 'development' || window.isDevEnvironment)) {
          console.warn('Using mock registration as fallback in development environment');
          
          // This is just for development/testing when the backend is not available
          // In production, you should never do this and let the real error propagate
          const mockResponse = {
            user: {
              id: 'temp-' + Math.random().toString(36).substring(2, 15),
              firstName: userData.firstName,
              lastName: userData.lastName,
              email: userData.email,
              companyName: userData.companyName,
              roles: ['user'],
              emailVerified: false
            },
            token: 'mock-jwt-token-' + Math.random().toString(36).substring(2, 15)
          };
          
          console.log('Created mock response:', mockResponse);
          return mockResponse;
        }
      }
      
      throw handleApiError(error);
    }
  },

  // Send verification email
  sendVerificationEmail: async (email) => {
    try {
      const response = await authAxios.post('/send-verification-email', { email });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Verify email address with token
  verifyEmail: async (token) => {
    try {
      const response = await authAxios.post('/verify-email', { token });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Check email verification status
  checkEmailVerificationStatus: async (email) => {
    try {
      const response = await authAxios.get(`/email-verification-status?email=${encodeURIComponent(email)}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Resend verification email
  resendVerificationEmail: async (email) => {
    try {
      const response = await authAxios.post('/resend-verification-email', { email });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get current user details
  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem('neon_auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await authAxios.get('/me');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update user profile
  updateProfile: async (userData) => {
    try {
      const response = await authAxios.put('/profile', userData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await authAxios.post('/change-password', {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Request a password reset
  forgotPassword: async (email) => {
    try {
      const response = await authAxios.post('/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Reset password with token
  resetPassword: async (token, newPassword) => {
    try {
      const response = await authAxios.post('/reset-password', {
        token,
        newPassword
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Verify token validity
  verifyToken: async () => {
    try {
      const token = localStorage.getItem('neon_auth_token');
      if (!token) {
        return { valid: false };
      }
      
      const response = await authAxios.get('/verify-token');
      return { valid: true, user: response.data };
    } catch (error) {
      // If verification fails, clear the token
      localStorage.removeItem('neon_auth_token');
      return { valid: false, error: error.message };
    }
  }
};

// Helper function to handle API errors
const handleApiError = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const statusCode = error.response.status;
    
    // Handle specific status codes
    if (statusCode === 401) {
      return new Error('Invalid or expired token');
    } else if (statusCode === 403) {
      return new Error('You do not have permission to perform this action');
    } else if (statusCode === 500) {
      console.error('Server error details:', error.response.data);
      return new Error('Server error. Our team has been notified.');
    }
    
    const errorMessage = error.response.data.message || error.response.data.error || 'Something went wrong';
    return new Error(errorMessage);
  } else if (error.request) {
    // The request was made but no response was received
    console.error('No response from server:', error.request);
    return new Error('No response from server. Please check your connection');
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('Request setup error:', error.message);
    return new Error('Error setting up request. Please try again later');
  }
};

// Token validation function to check if token is expired
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    // Extract the payload from the JWT
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    
    // Check if token has expiration claim
    if (!payload.exp) return false;
    
    // Convert exp to milliseconds and compare with current time
    // Add a 5 second buffer to account for clock differences
    const expirationTime = payload.exp * 1000;
    const currentTime = Date.now();
    
    return currentTime >= expirationTime - 5000; // 5 seconds buffer
  } catch (error) {
    console.error('Error parsing token:', error);
    return true; // Assume expired if there's an error
  }
}; 