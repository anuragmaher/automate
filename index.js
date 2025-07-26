// Main server file for API with simple API key authentication and LLM integration
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const llmRoutes = require('./routes/llm');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies

// Simple request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Root API endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'API is running1212122!',
    timestamp: new Date().toISOString(),
    endpoints: {
      llm: '/api/llm'
    },
    authentication: 'Use API key in x-api-key header for all protected endpoints'
  });
});

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Mount route handlers
app.use('/api/llm', llmRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? undefined : err.message
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Available API endpoints:');
  console.log(`- http://localhost:${PORT}/api (API info)`);
  console.log(`- http://localhost:${PORT}/api/health (Health check)`);
  console.log(`- http://localhost:${PORT}/api/llm/completion (LLM completion - requires API key)`);
  console.log(`- http://localhost:${PORT}/api/llm/chat (LLM chat - requires API key)`);
  console.log(`- http://localhost:${PORT}/api/llm/simple-prompt (Simple prompt - requires API key)`);
  
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
    console.warn('\x1b[33mWARNING: OPENAI_API_KEY is not set in .env file\x1b[0m');
    console.warn('\x1b[33mLLM endpoints will not work until you add your API key to the .env file\x1b[0m');
  }
  
  if (!process.env.API_KEY || process.env.API_KEY === 'your_api_key_here') {
    console.warn('\x1b[33mWARNING: API_KEY is using default value. Set a secure random string in .env file for protection\x1b[0m');
  }
});
