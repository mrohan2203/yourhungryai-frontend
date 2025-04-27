import React, { useState } from 'react';
import './RequestOtpPage.css'; // corrected import!
import { useNavigate } from 'react-router-dom';
import successIcon from './success-icon.svg';
import errorIcon from './error-icon.svg';
import yourhungrylogo from "./yourhungry-logo.png";

const RequestOtpPage = () => {
  const [email, setEmail] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleGenerateOtp = async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/generate-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      if (response.ok) {
        setSuccessMessage('OTP sent successfully to your email');
        localStorage.setItem('resetEmail', email); // store temporarily
        setTimeout(() => navigate('/verify-otp'), 2000);
      } else {
        setError(data.message || 'Could not send OTP');
      }
    } catch (err) {
      setError('Something went wrong. Try again.');
    }
  };

  return (
    <div className="request-otp-background">
      <div className="glass-box">
        {successMessage && (
          <div className="success-message-container">
            <img src={successIcon} alt="Success" className="message-icon" /> {successMessage}
          </div>
        )}
        {error && (
          <div className="error">
            <img src={errorIcon} alt="Error" className="message-icon" /> {error}
          </div>
        )}
        <img src={yourhungrylogo} alt="YourHungry Logo" className="request-logo" />
        <p><b>Stressed? Not needed</b></p>
        <p className="subtext">Forgot your password? No worries! We’re here to help</p>
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="continue-button" onClick={handleGenerateOtp}>
          Generate OTP
        </button>
        <p className="back-to-login-text">
          Remembered your password? <span onClick={() => navigate('/login')}>Back to Login</span>
        </p>
      </div>
    </div>
  );
};

export default RequestOtpPage;