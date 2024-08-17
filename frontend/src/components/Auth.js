import React, { useState } from 'react';
import axios from 'axios';

const Auth = ({ setToken }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      await axios.post('http://localhost:5000/auth/register', { username, password });
      alert('User registered successfully');
    } catch (error) {
      console.error('Error registering user:', error);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5000/auth/login', { username, password });
      setToken(response.data.token);
      alert('Logged in successfully');
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  return (
    <div className="auth">
      <h2>Register</h2>
      <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      <button onClick={handleRegister}>Register</button>
      <h2>Login</h2>
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Auth;
