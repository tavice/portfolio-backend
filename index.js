// Import dependencies
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow all origins during development
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

app.post('/api/contact', async (req, res) => {
  const { name, email, phone, message } = req.body;
  
  // Basic validation
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required' });
  }
  
  try {
    // For now, just log the contact form data
    console.log('Contact form submission:', { name, email, phone, message });
    
    // In a real implementation, you would send an email here
    // using nodemailer or another email service
    
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error processing contact form:', error);
    res.status(500).json({ error: 'Failed to process contact form' });
  }
});

// Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Allowed origins: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
}); 