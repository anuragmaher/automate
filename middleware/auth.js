// Authentication middleware for securing API endpoints
const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Middleware for JWT authentication
 * Verifies the JWT token from the Authorization header
 */
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  // Format should be: "Bearer [token]"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Invalid authorization format. Expected: Bearer [token]' });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

/**
 * Simple API key authentication for less sensitive operations
 * Validates the API key from the x-api-key header
 */
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ message: 'Invalid or missing API key' });
  }
  
  next();
};

module.exports = {
  authenticateJWT,
  authenticateApiKey
};
