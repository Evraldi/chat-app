import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

    useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem('token');

        if (token) {
          const response = await authService.getCurrentUser();
          if (response.data.success) {
            setCurrentUser({ ...response.data.data, role: response.data.data.role });
          } else {
            localStorage.removeItem('token');
          }
        }
            } catch (err) {
        // silent - token invalid, will be cleared
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();

    // Listen for forced logout events from api interceptor
    const handleForceLogout = () => {
      setCurrentUser(null);
    };
    window.addEventListener('auth:logout', handleForceLogout);
    return () => window.removeEventListener('auth:logout', handleForceLogout);
  }, []);

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

  const login = async (username, password) => {
    try {
      setError(null);
      const response = await authService.login(username, password);

      const userResponse = await authService.getCurrentUser();
      if (userResponse.data.success) {
        setCurrentUser(userResponse.data.data);
      }

      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    }
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    loading,
    error,
    register,
    login,
    logout,
    setCurrentUser,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
