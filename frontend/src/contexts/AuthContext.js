import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

// Create context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem('token');

        if (token) {
          const response = await authService.getCurrentUser();
          if (response.data.success) {
            setCurrentUser(response.data.data);
          } else {
            // Token is invalid or expired
            localStorage.removeItem('token');
          }
        }
      } catch (err) {
        console.error('Error checking authentication status:', err);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // Register a new user
  const register = async (username, password) => {
    try {
      setError(null);
      const response = await authService.register(username, password);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    }
  };

  // Login a user
  const login = async (username, password) => {
    try {
      setError(null);
      const response = await authService.login(username, password);

      // Handle different response formats
      if (response.data.success && response.data.data) {
        // Format: { success: true, data: { id, username, token } }
        const userData = response.data.data;
        setCurrentUser({
          id: userData.id,
          username: userData.username
        });
      } else if (response.data.success && response.data.token) {
        // Format: { success: true, token, id, username }
        setCurrentUser({
          id: response.data.id,
          username: response.data.username || username
        });
      } else if (response.data.token) {
        // Format: { token }
        // If we only have token but no user data, use the username from login
        setCurrentUser({
          username: username
        });
      }

      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    }
  };

  // Logout the current user
  const logout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  // Context value
  const value = {
    currentUser,
    loading,
    error,
    register,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
