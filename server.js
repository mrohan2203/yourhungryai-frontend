const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Resend } = require('resend');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
require('dotenv').config(); // Load environment variables

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB:', err));

const resend = new Resend(process.env.RESEND_API_KEY);

// User Schema with OTP support
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  chatLogs: [
    {
      id: String,
      title: String,
      messages: [
        {
          sender: String,
          text: String,
          timestamp: String,
          isNewChat: Boolean,
          markdown: Boolean,
          image: {
            url: String,
            alt: String
          }
        }
      ],
      createdAt: String
    }
  ],
  otp: String,
  otpExpires: Date,
});

const User = mongoose.model('User', userSchema);

app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Google OAuth strategy
passport.use(new GoogleStrategy({
  clientID: process.env.REACT_APP_GOOGLE_CLIENT_ID,
  clientSecret: process.env.REACT_APP_GOOGLE_CLIENT_SECRET,
  callbackURL: "https://api.yourhungryai.com/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  const email = profile.emails[0].value;
  let user = await User.findOne({ email });

  if (!user) {
    user = new User({ email, password: 'oauth_google' });
    await user.save();
  }

  return done(null, user);
}));

passport.use(new GitHubStrategy({
  clientID: process.env.REACT_APP_GITHUB_CLIENT_ID,
  clientSecret: process.env.REACT_APP_GITHUB_CLIENT_SECRET,
  callbackURL: "https://api.yourhungryai.com/auth/github/callback"
}, async (accessToken, refreshToken, profile, done) => {
  const email = profile.emails?.[0]?.value || `${profile.username}@github.com`;
  
  let user = await User.findOne({ email });
  if (!user) {
    user = new User({ email, password: 'oauth_github' });
    await user.save();
  }

  return done(null, user);
}));

// OAuth routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', passport.authenticate('google', {
  failureRedirect: '/login',
  session: false
}), (req, res) => {
  const token = jwt.sign({ email: req.user.email }, 'your-secret-key', { expiresIn: '1h' });
  res.redirect(`https://yourhungryai.com/login?token=${token}&email=${req.user.email}`);
});

app.get('/auth/github', passport.authenticate('github', { scope: [ 'user:email' ] }));

app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login', session: false }),
  (req, res) => {
    const token = jwt.sign({ email: req.user.email }, 'your-secret-key', { expiresIn: '1h' });
    res.redirect(`https://yourhungryai.com/login?token=${token}&email=${req.user.email}`);
  }
);

// Chat Logs Endpoints
app.get('/chatlogs/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.chatLogs || []);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving chat logs' });
  }
});

app.post('/chatlogs/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const sanitizedLogs = req.body.chatLogs.map(log => ({
      id: log.id,
      title: log.title || 'New Chat',
      createdAt: log.createdAt || new Date().toISOString(),
      messages: log.messages || []
    }));

    user.chatLogs = sanitizedLogs;
    await user.save();
    res.json({ message: 'Chat logs saved successfully' });
  } catch (err) {
    console.error('Error saving chat logs:', err);
    res.status(500).json({ message: 'Error saving chat logs' });
  }
});

// Signup Endpoint
app.post('/signup', async (req, res) => {
  const { email, password, retypePassword } = req.body;

  if (password !== retypePassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ email, password: hashedPassword });
  await user.save();

  res.status(201).json({ message: 'User created successfully' });
});

// Login Endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'Invalid email or password' });

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) return res.status(400).json({ message: 'Invalid email or password' });

  const token = jwt.sign({ email: user.email }, 'your-secret-key', { expiresIn: '1h' });

  res.status(200).json({ token, email: user.email });
});

// Generate OTP and send email
app.post('/generate-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'No account found with this email' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  user.otp = otp;
  user.otpExpires = otpExpires;
  await user.save();

  try {
    await resend.emails.send({
      from: process.env.RESEND_EMAIL_FROM,
      to: email,
      subject: 'Your OTP for Password Reset',
      text: `Your OTP is: ${otp}\n\nIt will expire in 10 minutes.`
    });
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Resend error:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// Verify OTP
app.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

  const user = await User.findOne({ email });
  if (!user || user.otp !== otp) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  if (user.otpExpires < new Date()) {
    return res.status(400).json({ message: 'OTP has expired' });
  }

  res.status(200).json({ message: 'OTP verified' });
});

// Update password (final step)
app.post('/update-password', async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ message: 'Email and new password are required' });
  }

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  res.status(200).json({ message: 'Password reset successfully', email: user.email });
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});