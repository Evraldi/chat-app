import React from 'react';
import PropTypes from 'prop-types';
import useForm from '../../hooks/useForm';
import Input from '../common/Input';
import Button from '../common/Button';
import Loader from '../common/Loader';
import './AuthForms.css';

/**
 * Login form component
 */
const LoginForm = ({ onLogin, onSwitchToRegister, loading, error }) => {
  // Form validation function
  const validateForm = (values) => {
    const errors = {};
    
    if (!values.username) {
      errors.username = 'Username is required';
    }
    
    if (!values.password) {
      errors.password = 'Password is required';
    } else if (values.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    return errors;
  };

  // Form submission handler
  const handleSubmit = async (values) => {
    await onLogin(values.username, values.password);
  };

  // Initialize form hook
  const { 
    values, 
    errors, 
    touched, 
    handleChange, 
    handleBlur, 
    handleSubmit: submitForm 
  } = useForm(
    { username: '', password: '' },
    handleSubmit,
    validateForm
  );

  return (
    <div className="auth-form-container">
      <h2 className="auth-form-title">Login</h2>
      
      <form onSubmit={submitForm} className="auth-form">
        <Input
          id="username"
          name="username"
          label="Username"
          value={values.username}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.username}
          touched={touched.username}
          required
        />
        
        <Input
          id="password"
          name="password"
          type="password"
          label="Password"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.password}
          touched={touched.password}
          required
        />
        
        {error && <div className="auth-form-error">{error}</div>}
        
        <div className="auth-form-actions">
          <Button 
            type="submit" 
            variant="primary" 
            fullWidth 
            disabled={loading}
          >
            {loading ? <Loader size="small" color="white" /> : 'Login'}
          </Button>
        </div>
      </form>
      
      <div className="auth-form-switch">
        Don't have an account?{' '}
        <Button 
          variant="text" 
          onClick={onSwitchToRegister}
          disabled={loading}
        >
          Register
        </Button>
      </div>
    </div>
  );
};

LoginForm.propTypes = {
  onLogin: PropTypes.func.isRequired,
  onSwitchToRegister: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string
};

export default LoginForm;
