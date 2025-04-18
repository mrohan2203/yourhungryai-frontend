import React, { useState } from 'react';
import './ResetPasswordPage.css';
import { useNavigate } from 'react-router-dom';
import errorIcon from './error-icon.svg';
import successIcon from './success-icon.svg';

const SetNewPasswordPage = () => {
  const [newPassword, setNewPassword] = useState('');
  const [retypePassword, setRetypePassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const email = localStorage.getItem('resetEmail');

  const handleUpdate = async () => {
    if (!newPassword || !retypePassword) {
      setError('Please fill out all fields');
      return;
    }
    if (newPassword !== retypePassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      const response = await fetch('${process.env.REACT_APP_API_URL}/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword })
      });

      const data = await response.json();
      if (response.ok) {
        setSuccessMessage('Password updated successfully!');
        localStorage.removeItem('resetEmail');
        setTimeout(() => navigate('/login'), 2500);
      } else {
        setError(data.message || 'Update failed');
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
      <p><b>Almost there</b></p>
      <p className="subtext">Type in your new password!</p>
      <input
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <input
        type="password"
        placeholder="Retype"
        value={retypePassword}
        onChange={(e) => setRetypePassword(e.target.value)}
      />
      <button className="continue-button" onClick={handleUpdate}>Update</button>
      <p className="back-to-login-text">
        Remember your password? <span onClick={() => navigate('/login')}>Sign up</span>
      </p>
    </div>
  );
};

export default SetNewPasswordPage;