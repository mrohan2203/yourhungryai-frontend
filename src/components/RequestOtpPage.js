import React, { useState } from 'react';
import './ResetPasswordPage.css';
import { useNavigate } from 'react-router-dom';
import successIcon from './success-icon.svg';
import errorIcon from './error-icon.svg';

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
      const response = await fetch('${process.env.REACT_APP_API_URL}/generate-otp', {
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
    <div className="reset-password-container">
      {successMessage && <div className="success-message-container">
        <img src={successIcon} alt="Success" className="message-icon" /> {successMessage}
      </div>}
      {error && <div className="error">
        <img src={errorIcon} alt="Error" className="message-icon" /> {error}
      </div>}
      <p><b>Stressed? Not needed</b></p>
      <p className="subtext">Forgot your password? No worries! We’re here to help</p>
      <input
        type="email"
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button className="continue-button" onClick={handleGenerateOtp}>Generate OTP</button>
      <p className="back-to-login-text">
        Remembered your password? <span onClick={() => navigate('/login')}>Back to Login</span></p>
    </div>
  );
};

export default RequestOtpPage;