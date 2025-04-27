import React, { useState } from 'react';
import './VerifyOtpPage.css'; 
import { useNavigate } from 'react-router-dom';
import successIcon from './success-icon.svg';
import errorIcon from './error-icon.svg';

const VerifyOtpPage = () => {
  const [otp, setOtp] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const email = localStorage.getItem('resetEmail');

  const handleVerify = async () => {
    if (!otp) {
      setError('Please enter the OTP');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });

      const data = await response.json();
      if (response.ok) {
        setSuccessMessage('OTP verified! Redirecting...');
        setTimeout(() => navigate('/set-new-password'), 2000);
      } else {
        setError(data.message || 'OTP verification failed');
      }
    } catch (err) {
      setError('Something went wrong. Try again.');
    }
  };

  return (
    <div className="verify-otp-background">
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
        <p><b>Just a few steps....</b></p>
        <p className="subtext">Type the OTP received in your email</p>
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
        <button className="continue-button" onClick={handleVerify}>Verify</button>
        <p className="back-to-login-text">
          Entered wrong email? <span onClick={() => navigate('/login')}>Back to Login</span>
        </p>
      </div>
    </div>
  );
};

export default VerifyOtpPage;