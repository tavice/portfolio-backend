// Import Dependencies
import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import helmet from 'helmet';
import { body, validationResult } from 'express-validator';

// Load environment variables
config();

const {
  MY_PASSWORD,
  MY_EMAIL,
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URL
} = process.env;

// Import JSON files
import projects from './projects.json' assert { type: 'json' };
import about from './about.json' assert { type: 'json' };

// Create our app object
const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
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
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
