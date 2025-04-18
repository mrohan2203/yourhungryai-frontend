import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './WelcomePage.css';

const WelcomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const rememberMe = localStorage.getItem('rememberMe');
    
    if (token) {
      // If "Remember me" was checked, auto-redirect to chatbot
      if (rememberMe === 'true') {
        navigate('/chatbot');
      } else {
        // Clear auth data if not remembered
        localStorage.removeItem('token');
        localStorage.removeItem('email');
      }
    }
  }, [navigate]);

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleSignupClick = () => {
    navigate('/signup');
  };

  return (
    <div className="welcome-container">
      <h1 className="heading">Welcome to YourHungryAI</h1>
      <p className="subtext">Log in or Sign up to continue</p>
      <div className="button-container">
        <button className="login-button" onClick={handleLoginClick}>Log in</button>
        <button className="signup-button" onClick={handleSignupClick}>Sign up</button>
      </div>
    </div>
  );
};

export default WelcomePage;