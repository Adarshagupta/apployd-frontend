const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const port = 3082; // Using a different port to avoid conflicts

// Middleware
app.use(express.json());
app.use(cors());

// Email configuration
const emailConfig = {
  smtp: {
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true,
    auth: {
      user: 'adarsh@infin8t.tech',
      pass: 'Adarsh@800850'
    }
  },
  defaultFrom: '"Neon App" <adarsh@infin8t.tech>'
};

// Create transporter
const transporter = nodemailer.createTransport(emailConfig.smtp);

// Verify connection on startup
transporter.verify(function(error, success) {
  if (error) {
    console.error('SMTP connection error:', error);
  } else {
    console.log('SMTP server is ready to send emails');
  }
});

// Email templates
const emailTemplates = {
  verification: ({ verificationLink }) => ({
    subject: 'Verify your email address',
    html: `
      <h1>Email Verification</h1>
      <p>Thank you for registering with Neon. Please click the link below to verify your email address:</p>
      <p><a href="${verificationLink}">Verify Email Address</a></p>
      <p>If you did not sign up for an account, you can safely ignore this email.</p>
    `
  }),
  'password-reset': ({ resetLink }) => ({
    subject: 'Reset your password',
    html: `
      <h1>Password Reset</h1>
      <p>You requested a password reset for your Neon account. Please click the link below to reset your password:</p>
      <p><a href="${resetLink}">Reset Password</a></p>
      <p>If you did not request a password reset, you can safely ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
    `
  })
};

// Route to send emails
app.post('/api/email/send', async (req, res) => {
  try {
    console.log('Email request received:', req.body);
    const { to, subject, templateName, templateData } = req.body;
    
    // Validate required fields
    if (!to) {
      return res.status(400).json({ error: 'Recipient email is required' });
    }
    
    if (!templateName) {
      return res.status(400).json({ error: 'Email template name is required' });
    }
    
    // Get template
    const template = emailTemplates[templateName];
    if (!template) {
      return res.status(400).json({ error: `Template '${templateName}' not found` });
    }
    
    // Generate email content from template
    const { subject: templateSubject, html } = template(templateData || {});
    
    // Send email
    const info = await transporter.sendMail({
      from: emailConfig.defaultFrom,
      to,
      subject: subject || templateSubject,
      html
    });
    
    console.log(`Email sent: ${info.messageId}`);
    
    return res.status(200).json({
      success: true,
      messageId: info.messageId
    });
  } catch (error) {
    console.error('Email sending error:', error);
    return res.status(500).json({
      error: 'Failed to send email',
      details: error.message
    });
  }
});

// Basic health check endpoint
app.get('/api/email/status', (req, res) => {
  res.json({
    status: 'ok',
    smtpConnected: true,
    server: 'Email API Server',
    version: '1.0.0'
  });
});

// Start server
app.listen(port, () => {
  console.log(`Email API server running at http://localhost:${port}`);
}); 