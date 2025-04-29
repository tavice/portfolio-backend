// Import Dependencies
import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import helmet from 'helmet';
import { body, validationResult } from 'express-validator';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
config();

const {
  MY_PASSWORD,
  MY_EMAIL,
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URL,
  PORT = 10000,
  FRONTEND_URL = 'http://localhost:3000'
} = process.env;

// Parse FRONTEND_URL to handle multiple origins
const allowedOrigins = FRONTEND_URL.split(',').map(url => url.trim());

// Get current file path and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import JSON files
const projects = JSON.parse(readFileSync(join(__dirname, './projects.json'), 'utf8'));
const about = JSON.parse(readFileSync(join(__dirname, './about.json'), 'utf8'));

// Create our app object
const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Portfolio API is running" });
});

app.get("/projects", (req, res) => {
  res.json(projects);
});

app.get("/about", (req, res) => {
  res.json(about);
});

// Contact form validation
const contactValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
  body('phone').optional().trim()
];

app.post("/api/contact", contactValidation, async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, phone, message } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: MY_EMAIL,
        pass: MY_PASSWORD,
      },
    });

    const mailOptions = {
      from: email,
      to: MY_EMAIL,
      subject: "New Contact Form Submission",
      html: `
        <h1>New Contact Form Submission</h1>
        <ul>
          <li>Name: ${name}</li>
          <li>Email: ${email}</li>
          <li>Phone: ${phone || 'Not provided'}</li>
          <li>Message: ${message}</li>
        </ul>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
}); 