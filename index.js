// Import dependencies
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const { sendEmail } = require('./src/services/emailService');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: ['https://thomasavice.netlify.app', 'http://localhost:3000','https://thomasavice.com/'],
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

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
app.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    // Validate input
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required' });
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