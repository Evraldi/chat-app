import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import './AuthForms.css';

/**
 * Authentication page component
 */
const AuthPage = () => {
  const { login, register, error: authError, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');

  // Handle login
  const handleLogin = async (username, password) => {
    try {
      setError('');
      await login(username, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  // Handle registration
  const handleRegister = async (username, password) => {
    try {
      setError('');
      await register(username, password);
      // Switch to login form after successful registration
      setIsLogin(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-page">
      {isLogin ? (
        <LoginForm
          onLogin={handleLogin}
          onSwitchToRegister={() => setIsLogin(false)}
          loading={loading}
          error={error || authError}
        />
      ) : (
        <RegisterForm
          onRegister={handleRegister}
          onSwitchToLogin={() => setIsLogin(true)}
          loading={loading}
          error={error || authError}
        />
      )}
    </div>
  );
};

export default AuthPage;
