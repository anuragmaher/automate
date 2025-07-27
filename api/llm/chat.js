// Serverless function for chat endpoint
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

// Import the LLM controller with proper path resolution
let controllerPath;
try {
  // Try to resolve the path for Vercel production environment
  controllerPath = require.resolve('../../controllers/llm.controller');
} catch (error) {
  // Fallback for Vercel environment
  controllerPath = path.join(process.cwd(), 'controllers', 'llm.controller.js');
}

const LLMController = require(controllerPath);

module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed. Use POST.'
    });
  }

  // API key authentication
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ 
      success: false,
      message: 'Invalid or missing API key. Please provide a valid API key in the x-api-key header.' 
    });
  }
  
  try {
    const result = await LLMController.handleChatCompletionRequest(req.body);
    
    if (result.success) {
      return res.json(result.data);
    } else {
      return res.status(result.statusCode).json({
        success: false,
        message: result.message,
        error: result.error
      });
    }
  } catch (error) {
    console.error('LLM API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
