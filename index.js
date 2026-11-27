// Import dependencies
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { sendEmail } = require('./src/services/emailService');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',') 
      : ['https://thomasavice.netlify.app', 'http://localhost:3000', 'https://thomasavice.com'];
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));
// Render (and most hosts) sit behind one proxy; needed so rate limiting sees the real client IP
app.set('trust proxy', 1);
app.use(express.json({ limit: '10kb' }));

// Load data
const projects = JSON.parse(fs.readFileSync(path.join(__dirname, './src/projects.json'), 'utf8'));
const about = JSON.parse(fs.readFileSync(path.join(__dirname, './src/about.json'), 'utf8'));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Portfolio API is running' });
});

app.get('/projects', (req, res) => {
  res.json(projects);
});

app.get('/about', (req, res) => {
  res.json(about);
});

// Contact form endpoint
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 5, // 5 messages per IP per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many messages. Please try again later.' }
});

const LIMITS = { name: 100, email: 254, subject: 200, message: 5000 };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

app.post('/contact', contactLimiter, async (req, res) => {
  try {
    const { name, email, subject, message, website } = req.body || {};

    // Honeypot: real visitors never see this hidden field, bots fill it in.
    // Pretend it worked so the bot learns nothing, but send nothing.
    if (website) {
      return res.json({ success: true, message: 'Email sent successfully' });
    }
    
    // Validate input
    const fields = { name, email, subject, message };
    if (Object.values(fields).some((v) => typeof v !== 'string' || !v.trim())) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    if (Object.entries(fields).some(([key, v]) => v.length > LIMITS[key])) {
      return res.status(400).json({ error: 'One or more fields are too long' });
    }
    if (!EMAIL_PATTERN.test(email.trim())) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    // Send email
    await sendEmail(name, email, subject, message);
    
    res.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error in contact endpoint:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Allowed origins: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
}); 