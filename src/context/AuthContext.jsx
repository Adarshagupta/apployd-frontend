import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth/authApi';

// Create the context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        // First check if we have a token
        const token = localStorage.getItem('neon_auth_token');
        
        if (!token) {
          // No token found, consider the user logged out
          setLoading(false);
          return;
        }
        
        // Verify the token is valid
        const tokenVerification = await authApi.verifyToken();
        
        if (tokenVerification.valid) {
          // Token is valid, get user data
          const userData = await authApi.getCurrentUser();
          setCurrentUser(userData);
          setIsAuthenticated(true);
        } else {
          // Token is invalid, clear it
          localStorage.removeItem('neon_auth_token');
        }
      } catch (err) {
        console.error('Authentication error:', err);
        // Clear any invalid tokens
        localStorage.removeItem('neon_auth_token');
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      console.log('Starting login process in AuthContext');
      
      // Add timestamp to help with debugging
      const requestTime = new Date().toISOString();
      console.log(`Login request started at: ${requestTime}`);
      
      const response = await authApi.login(email, password);
      console.log('Login API response received');
      
      // Save token to local storage
      localStorage.setItem('neon_auth_token', response.token);
      
      // Set the current user
      setCurrentUser(response.user);
      setIsAuthenticated(true);
      
      // Redirect to dashboard
      navigate('/dashboard');
      
      return { success: true };
    } catch (err) {
      console.error('Login error in AuthContext:', err);
      
      // Add more detailed error information
      const errorDetails = {
        message: err.message,
        stack: err.stack,
        time: new Date().toISOString()
      };
      console.error('Login error details:', errorDetails);
      
      setError(err.message || 'Failed to login');
      return { 
        success: false, 
        error: err.message || 'Failed to login',
        details: errorDetails
      };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      console.log('Starting registration process in AuthContext');
      
      // Add timestamp to help with debugging
      const requestTime = new Date().toISOString();
      console.log(`Registration request started at: ${requestTime}`);
      
      const response = await authApi.register(userData);
      console.log('Registration API response received:', response);
      
      // Auto login after registration
      if (response && response.token) {
        localStorage.setItem('neon_auth_token', response.token);
        setCurrentUser(response.user);
        setIsAuthenticated(true);
        
        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        console.warn('Registration response missing token:', response);
        throw new Error('Registration successful but no token received');
      }
      
      return { success: true };
    } catch (err) {
      console.error('Registration error in AuthContext:', err);
      
      // Add more detailed error information
      const errorDetails = {
        message: err.message,
        stack: err.stack,
        time: new Date().toISOString()
      };
      console.error('Error details:', errorDetails);
      
      setError(err.message || 'Failed to register');
      return { 
        success: false, 
        error: err.message || 'Failed to register',
        details: errorDetails
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('neon_auth_token');
    setCurrentUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return currentUser?.roles?.includes(role) || false;
  };

  // Value object to provide through context
  const value = {
    currentUser,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    hasRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 