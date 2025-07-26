// Serverless function for completion endpoint
require('dotenv').config();
const { generateCompletion } = require('../../utils/openai');

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
    const { prompt, model, temperature, maxTokens } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required'
      });
    }
    
    const result = await generateCompletion(prompt, {
      model,
      temperature, 
      maxTokens
    });
    
    if (result.success) {
      return res.json({
        success: true,
        completion: result.text,
        data: result.data
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Error generating completion',
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
