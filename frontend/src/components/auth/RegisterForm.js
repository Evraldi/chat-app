import React from 'react';
import PropTypes from 'prop-types';
import useForm from '../../hooks/useForm';
import Input from '../common/Input';
import Button from '../common/Button';
import Loader from '../common/Loader';
import './AuthForms.css';

/**
 * Registration form component
 */
const RegisterForm = ({ onRegister, onSwitchToLogin, loading, error }) => {
  // Form validation function
  const validateForm = (values) => {
    const errors = {};
    
    if (!values.username) {
      errors.username = 'Username is required';
    } else if (values.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }
    
    if (!values.password) {
      errors.password = 'Password is required';
    } else if (values.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (!values.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (values.password !== values.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    return errors;
  };

  // Form submission handler
  const handleSubmit = async (values) => {
    await onRegister(values.username, values.password);
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
    { username: '', password: '', confirmPassword: '' },
    handleSubmit,
    validateForm
  );

  return (
    <div className="auth-form-container">
      <h2 className="auth-form-title">Register</h2>
      
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
        
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          label="Confirm Password"
          value={values.confirmPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.confirmPassword}
          touched={touched.confirmPassword}
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
            {loading ? <Loader size="small" color="white" /> : 'Register'}
          </Button>
        </div>
      </form>
      
      <div className="auth-form-switch">
        Already have an account?{' '}
        <Button 
          variant="text" 
          onClick={onSwitchToLogin}
          disabled={loading}
        >
          Login
        </Button>
      </div>
    </div>
  );
};

RegisterForm.propTypes = {
  onRegister: PropTypes.func.isRequired,
  onSwitchToLogin: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string
};

export default RegisterForm;
