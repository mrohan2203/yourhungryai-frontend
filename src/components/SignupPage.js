import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignupPage.css';
import errorIcon from './error-icon.svg';

const SignupPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [retypePassword, setRetypePassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (password !== retypePassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, retypePassword }),
      });
      const data = await response.json();
      if (response.ok) {
        navigate('/login', { state: { successMessage: 'Account created successfully! Please log in.' } });
      } else {
        setError(data.message || 'Signup failed. Please try again.');
      }
    } catch (err) {
      setError('Signup failed. Please try again.');
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="signup-background">
      <div className="glass-box">
        {error && (
          <div className="error">
            <img src={errorIcon} alt="Error" className="message-icon" />
            {error}
          </div>
        )}
        <p className="signup-welcome"><b>YourAI says Hello!</b></p>
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Retype Password"
          value={retypePassword}
          onChange={(e) => setRetypePassword(e.target.value)}
        />
        <button className="continue-button" onClick={handleSubmit}>
          Continue
        </button>
        <p className="login-text">
          Have an account? <span onClick={handleLoginClick}>Login</span>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;