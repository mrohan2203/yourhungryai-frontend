import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './WelcomePage.css';

const WelcomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const email = params.get('email');
  
    if (token && email) {
      localStorage.setItem('token', token);
      localStorage.setItem('email', email);
      navigate('/chatbot');
      return;
    }
  
    const rememberedToken = localStorage.getItem('token');
    const rememberMe = localStorage.getItem('rememberMe');
  
    if (rememberedToken && rememberMe === 'true') {
      navigate('/chatbot');
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('email');
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
      <h1 className="heading">Welcome to YourHungry AI - your online culinary assistant.</h1>
      <p className="subtext">Log in or Sign up to continue</p>
      <div className="button-container">
        <button className="login-button" onClick={handleLoginClick}>Log in</button>
        <button className="signup-button" onClick={handleSignupClick}>Sign up</button>
      </div>
    </div>
  );
};

export default WelcomePage;