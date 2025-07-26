// Simple API key authentication middleware
require('dotenv').config();

/**
 * API key authentication middleware
 * Validates the API key from the x-api-key header
 */
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ 
      success: false,
      message: 'Invalid or missing API key. Please provide a valid API key in the x-api-key header.' 
    });
  }
  
  next();
};

module.exports = authenticateApiKey;
