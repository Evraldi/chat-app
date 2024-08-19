import React, { useState } from 'react';
import axios from 'axios';
import '../css/auth.css';

const Auth = ({ setUsername }) => {
  const [username, setUsernameInput] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(true);

  const handleRegister = async () => {
    try {
      await axios.post('http://localhost:5000/auth/register', { username, password });
      alert('User registered successfully');
      setIsRegistering(false);
    } catch (error) {
      setError('Error registering user');
      console.error('Error registering user:', error);
    }
  };

  const handleLogin = async () => {
    try {
      await axios.post('http://localhost:5000/auth/login', { username, password });
      setUsername(username);
      alert('Logged in successfully');
    } catch (error) {
      setError('Error logging in');
      console.error('Error logging in:', error);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>{isRegistering ? 'Register' : 'Login'}</h2>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input 
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsernameInput(e.target.value)}
            placeholder="Username"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input 
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
        </div>
        <div className="form-group">
          {isRegistering ? (
            <>
              <button onClick={handleRegister}>Register</button>
              <p className="switch-mode">
                Already have an account? 
                <button onClick={() => setIsRegistering(false)}>Login</button>
              </p>
            </>
          ) : (
            <>
              <button onClick={handleLogin}>Login</button>
              <p className="switch-mode">
                Don't have an account? 
                <button onClick={() => setIsRegistering(true)}>Register</button>
              </p>
            </>
          )}
        </div>
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default Auth;
