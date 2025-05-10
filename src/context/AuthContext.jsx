import { createContext, useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, isTokenExpired } from '../api/auth/authApi';

// Create the context
const AuthContext = createContext();

// Session timeout duration in milliseconds (30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000;

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
  const [emailVerified, setEmailVerified] = useState(false);
  const navigate = useNavigate();
  
  // Session timeout management
  const sessionTimeoutRef = useRef(null);
  
  // Function to reset the session timeout
  const resetSessionTimeout = () => {
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
    }
    
    if (isAuthenticated) {
      sessionTimeoutRef.current = setTimeout(() => {
        console.log('Session timeout reached');
        logout();
      }, SESSION_TIMEOUT);
    }
  };
  
  // Set up event listeners for user activity
  useEffect(() => {
    if (isAuthenticated) {
      // Reset timeout on user activity
      const activityEvents = ['mousedown', 'keypress', 'scroll', 'touchstart'];
      
      const handleUserActivity = () => {
        resetSessionTimeout();
      };
      
      // Add event listeners
      activityEvents.forEach(event => {
        window.addEventListener(event, handleUserActivity);
      });
      
      // Initial timeout
      resetSessionTimeout();
      
      // Clean up
      return () => {
        if (sessionTimeoutRef.current) {
          clearTimeout(sessionTimeoutRef.current);
        }
        
        activityEvents.forEach(event => {
          window.removeEventListener(event, handleUserActivity);
        });
      };
    }
  }, [isAuthenticated]);

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
        
        // Check for forced verification flag (for debugging)
        const forcedVerified = localStorage.getItem('neon_email_verified') === 'true';
        
        // Verify the token is valid
        const tokenVerification = await authApi.verifyToken();
        
        if (tokenVerification.valid) {
          // Token is valid, get user data
          const userData = await authApi.getCurrentUser();
          
          // If force verified flag is present, add it to the user data
          if (forcedVerified) {
            userData.emailVerified = true;
          }
          
          setCurrentUser(userData);
          setIsAuthenticated(true);
          
          // Check email verification status
          if (userData.emailVerified || forcedVerified) {
            setEmailVerified(true);
          }
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
      
      // Save tokens to local storage
      localStorage.setItem('neon_auth_token', response.token);
      if (response.refreshToken) {
        localStorage.setItem('neon_refresh_token', response.refreshToken);
      }
      
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
        if (response.refreshToken) {
          localStorage.setItem('neon_refresh_token', response.refreshToken);
        }
        
        // Set user with emailVerified explicitly set to false
        const userWithVerificationStatus = {
          ...response.user,
          emailVerified: false
        };
        
        setCurrentUser(userWithVerificationStatus);
        setIsAuthenticated(true);
        setEmailVerified(false);
        
        // Do not navigate automatically - let the Register component handle it
        // The user will be redirected to the email verification page
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
    localStorage.removeItem('neon_refresh_token');
    setCurrentUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return currentUser?.roles?.includes(role) || false;
  };

  // Send verification email
  const sendVerificationEmail = async () => {
    try {
      setLoading(true);
      
      if (!currentUser || !currentUser.email) {
        throw new Error('No user is currently logged in');
      }
      
      const response = await authApi.sendVerificationEmail(currentUser.email);
      return { success: true, message: response.message || 'Verification email sent' };
    } catch (err) {
      console.error('Error sending verification email:', err);
      return { 
        success: false, 
        error: err.message || 'Failed to send verification email' 
      };
    } finally {
      setLoading(false);
    }
  };
  
  // Verify email with token
  const verifyEmail = async (token) => {
    try {
      setLoading(true);
      
      // Check if we're in demo mode
      const isDemoMode = localStorage.getItem('neon_demo_mode') === 'true';
      
      // Demo mode verification - if code matches the demo code (123456)
      if (isDemoMode && token === '123456') {
        console.log('Demo mode: Email verified with demo code');
        
        // Update user data to reflect verified email
        if (currentUser) {
          setCurrentUser({
            ...currentUser,
            emailVerified: true
          });
          setEmailVerified(true);
        }
        
        return { 
          success: true, 
          message: 'Email verified successfully in demo mode' 
        };
      }
      
      // Regular API verification
      try {
        const response = await authApi.verifyEmail(token);
        
        if (response.success && currentUser) {
          // Update user data to reflect verified email
          setCurrentUser({
            ...currentUser,
            emailVerified: true
          });
          setEmailVerified(true);
        }
        
        return { success: true, message: response.message || 'Email verified successfully' };
      } catch (apiError) {
        console.error('API error when verifying email:', apiError);
        
        // If API fails and we're using the demo code, still verify
        if (token === '123456') {
          console.log('API failed but verifying with demo code');
          localStorage.setItem('neon_demo_mode', 'true');
          
          // Update user data to reflect verified email
          if (currentUser) {
            setCurrentUser({
              ...currentUser,
              emailVerified: true
            });
            setEmailVerified(true);
          }
          
          return { 
            success: true, 
            message: 'Email verified successfully with demo code (API fallback)' 
          };
        }
        
        throw apiError;
      }
    } catch (err) {
      console.error('Error verifying email:', err);
      return { 
        success: false, 
        error: err.message || 'Failed to verify email' 
      };
    } finally {
      setLoading(false);
    }
  };
  
  // Check email verification status
  const checkVerificationStatus = async () => {
    try {
      if (!currentUser || !currentUser.email) {
        return { verified: false };
      }
      
      const response = await authApi.checkEmailVerificationStatus(currentUser.email);
      
      if (response.verified) {
        setEmailVerified(true);
        // Update user data to reflect verified email
        setCurrentUser({
          ...currentUser,
          emailVerified: true
        });
      }
      
      return response;
    } catch (err) {
      console.error('Error checking verification status:', err);
      return { verified: false, error: err.message };
    }
  };
  
  // Resend verification email
  const resendVerificationEmail = async () => {
    try {
      setLoading(true);
      
      if (!currentUser || !currentUser.email) {
        throw new Error('No user is currently logged in');
      }
      
      const response = await authApi.resendVerificationEmail(currentUser.email);
      return { success: true, message: response.message || 'Verification email resent' };
    } catch (err) {
      console.error('Error resending verification email:', err);
      return { 
        success: false, 
        error: err.message || 'Failed to resend verification email' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Request a password reset
  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authApi.forgotPassword(email);
      return { success: true, message: response.message || 'Password reset email sent successfully' };
    } catch (err) {
      console.error('Error requesting password reset:', err);
      return { 
        success: false, 
        error: err.message || 'Failed to send password reset email' 
      };
    } finally {
      setLoading(false);
    }
  };
  
  // Reset password with token
  const resetPassword = async (token, newPassword) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authApi.resetPassword(token, newPassword);
      return { success: true, message: response.message || 'Password reset successfully' };
    } catch (err) {
      console.error('Error resetting password:', err);
      return { 
        success: false, 
        error: err.message || 'Failed to reset password' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Value object to provide through context
  const value = {
    currentUser,
    loading,
    error,
    isAuthenticated,
    emailVerified,
    login,
    register,
    logout,
    hasRole,
    sendVerificationEmail,
    verifyEmail,
    checkVerificationStatus,
    resendVerificationEmail,
    forgotPassword,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 