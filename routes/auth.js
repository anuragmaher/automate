// Authentication routes
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
require('dotenv').config();

/**
 * POST /api/auth/login
 * Simple authentication endpoint that generates a JWT token
 * In a real application, this would validate credentials against a database
 */
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // This is a simplified example - in a real app, you'd verify against a database
  // For demo purposes, we're using hardcoded credentials
  if (username === 'admin' && password === 'password') {
    const user = { id: 1, username: 'admin', role: 'admin' };
    
    // Generate JWT token
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '24h' });
    
    res.json({
      success: true,
      message: 'Authentication successful',
      token: token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

/**
 * GET /api/auth/verify
 * Verify a JWT token
 */
router.get('/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'No token provided' 
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({
      success: true,
      message: 'Token is valid',
      user: decoded
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token',
      error: error.message
    });
  }
});

module.exports = router;
