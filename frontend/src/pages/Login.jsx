import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

// Login page component - where users sign in to their account
const Login = ({ setUser, showNotification }) => {
  // Store what user types in the form
  const [loginFormData, setLoginFormData] = useState({ 
    email: '', 
    password: '' 
  });
  
  // Store any error messages
  const [loginError, setLoginError] = useState('');
  
  // Function to navigate to different pages
  const goToPage = useNavigate();

  // Function that runs when user submits the login form
  const handleLoginSubmit = async (event) => {
    // Prevent page from refreshing when form is submitted
    event.preventDefault();
    
    try {
      // Send login request to server
      const loginResponse = await authAPI.login(loginFormData);
      const { token, user } = loginResponse.data;
      
      // Save login information in browser storage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Update app state with logged in user
      setUser(user);
      
      // Go to home page after successful login
      goToPage('/');
      
    } catch (error) {
      // If login fails, show error message
      const errorMessage = error.response?.data?.message || 'Login failed';
      setLoginError(errorMessage);
      showNotification(errorMessage, 'error');
    }
  };

  // Function to update form data when user types
  const updateEmailField = (event) => {
    setLoginFormData({ 
      ...loginFormData, 
      email: event.target.value 
    });
  };
  
  const updatePasswordField = (event) => {
    setLoginFormData({ 
      ...loginFormData, 
      password: event.target.value 
    });
  };

  return (
    <div className="container">
      <form onSubmit={handleLoginSubmit} className="form">
        <h2>Login to Your Account</h2>
        
        {/* Show error message if login fails */}
        {loginError && (
          <div style={{ color: 'red', marginBottom: '1rem' }}>
            {loginError}
          </div>
        )}
        
        {/* Email input field */}
        <div className="form-group">
          <label>Email Address:</label>
          <input
            type="email"
            value={loginFormData.email}
            onChange={updateEmailField}
            placeholder="Enter your email"
            required
          />
        </div>
        
        {/* Password input field */}
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={loginFormData.password}
            onChange={updatePasswordField}
            placeholder="Enter your password"
            required
          />
        </div>
        
        {/* Login button */}
        <button type="submit" className="btn">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;