import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RequestOtpPage.css';
import errorIcon from './error-icon.svg';
import successIcon from './success-icon.svg';
import yourhungrylogo from './yourhungry-logo.png';

const RequestOtpPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleGenerateOtp = async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccessMessage(data.message || 'OTP sent successfully');
        setTimeout(() => navigate('/verify-otp', { state: { email } }), 1500);
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Failed to send OTP');
    }
  };
  return (
    <div className="request-otp-background">
      <div className="glass-box">
        {successMessage && (
          <div className="success-message-container">
            <img src={successIcon} alt="Success" className="message-icon" />
            {successMessage}
          </div>
        )}
        {error && (
          <div className="error">
            <img src={errorIcon} alt="Error" className="message-icon" />
            {error}
          </div>
        )}
        <img src={yourhungrylogo} alt="YourHungry Logo" className="otp-logo" />
        <p><b>Reset Your Password</b></p>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="continue-button" onClick={handleGenerateOtp}>
          Continue
        </button>
      </div>
    </div>
  );
};
export default RequestOtpPage;