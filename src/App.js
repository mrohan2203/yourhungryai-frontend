import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import WelcomePage from './components/WelcomePage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import ChatbotPage from './components/ChatbotPage';
import ResetPasswordPage from './components/ResetPasswordPage';
import ProtectedRoute from './components/ProtectedRoute';
import RequestOtpPage from './components/RequestOtpPage';
import VerifyOtpPage from './components/VerifyOtpPage';
import SetNewPasswordPage from './components/SetNewPasswordPage';

function App() {
  // Check for a valid token on app startup
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Token exists, user is logged in
      // No need to redirect here; ProtectedRoute will handle it
    } else {
      // No token, user is not logged in
      // Redirect to WelcomePage is handled by the fallback route
    }
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/request-otp" element={<RequestOtpPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/set-new-password" element={<SetNewPasswordPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/chatbot" element={<ChatbotPage />} />
        </Route>

        {/* Fallback Route (Redirect to WelcomePage if no token exists) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;