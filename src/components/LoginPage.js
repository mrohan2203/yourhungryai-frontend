import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./LoginPage.css";
import successIcon from "./success-icon.svg";
import errorIcon from "./error-icon.svg";
import googleLogo from "./google-icon.svg";
import githubLogo from "./github-icon.svg";
import yourhungrylogo from "./yourhungry-logo.png";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Check for remembered email on component mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
    }
  }, [location]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const email = params.get('email');
  
    if (token && email) {
      localStorage.setItem('token', token);
      localStorage.setItem('email', email);
      // ✅ Google Analytics event for OAuth login
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'oauth_login', {
          event_category: 'Authentication',
          event_label: email,
        });
      }
      navigate('/chatbot');
    }
  }, [navigate]);

  const handleSubmit = async () => {
    if (!email || !password) {
      setError("Please enter your email and password");
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        // Always store token in localStorage (for current session)
        localStorage.setItem("token", data.token);
        localStorage.setItem("email", data.email);

        // Store rememberMe preference and email only (never password)
        if (rememberMe) {
          localStorage.setItem("rememberMe", "true");
          localStorage.setItem("rememberedEmail", email);
        } else {
          localStorage.removeItem("rememberMe");
          localStorage.removeItem("rememberedEmail");
        }

        navigate("/chatbot");
      } else {
        setError(data.message || "Invalid email or password");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    }
  };

  const handleSignupClick = () => {
    navigate("/signup");
  };

  return (
    <div className="login-container">
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
      <img src={yourhungrylogo} alt="YourHungry Logo" className="login-logo" />
      <p>
        <b>Welcome back</b>
      </p>
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
      <div className="remember-me">
        <input
          type="checkbox"
          id="rememberMe"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
        />
        <label htmlFor="rememberMe">Remember me</label>
      </div>
      <button className="continue-button" onClick={handleSubmit}>
        Continue
      </button>
      <p className="forgot-password-text">
        Forgot your password? <span onClick={() => navigate('/request-otp')}>Reset it</span>
      </p>
      <p className="signup-text">
        Don't have an account? <span onClick={handleSignupClick}>Sign up</span>
      </p>
      <div className="or-divider">
        <span>OR</span>
      </div>
      <div className="social-buttons">
        <button className="google-button" onClick={() => window.location.href = `${process.env.REACT_APP_API_URL}/auth/google`}>
          <img src={googleLogo} alt="Google Logo" className="button-logo" />
          Continue with Google
        </button>

        <button className="github-button" onClick={() => window.location.href = `${process.env.REACT_APP_API_URL}/auth/github`}>
          <img src={githubLogo} alt="GitHub Logo" className="button-logo" />
          Continue with GitHub
        </button>
      </div>
    </div>
  );
};

export default LoginPage;

/* eof */