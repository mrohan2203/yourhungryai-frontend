import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResetPasswordPage.css';
import errorIcon from './error-icon.svg';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [retypePassword, setRetypePassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }

    if (!newPassword || !retypePassword) {
      setError('Password field(s) empty');
      return;
    }

    if (newPassword !== retypePassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      const response = await fetch('${process.env.REACT_APP_API_URL}/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          setError('Account with this email does not exist');
        } else {
          setError(data.message || 'Password reset failed. Please try again.');
        }
        return;
      }

      // Successful password reset
      navigate('/login', {
        state: {
          successMessage: 'Password reset successfully! Please log in with your new password.',
          email: data.email
        }
      });

    } catch (err) {
      setError('Password reset failed. Please try again.');
    }
  };

  return (
    <div className="reset-password-container">
      {error && (
        <div className="error">
          <img src={errorIcon} alt="Error" className="message-icon" />
          {error}
        </div>
      )}
      <p><b>Reset Your Password</b></p>
      <p className="subtext">Forgot your password? No worries! We're here to help</p>
      
      <input
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <input
        type="password"
        placeholder="Retype Password"
        value={retypePassword}
        onChange={(e) => setRetypePassword(e.target.value)}
      />
      
      <button className="continue-button" onClick={handleSubmit}>
        Update Password
      </button>

      <p className="back-to-login-text">
        Remember your password? <span onClick={() => navigate('/login')}>Back to Login</span>
      </p>
    </div>
  );
};

export default ResetPasswordPage;