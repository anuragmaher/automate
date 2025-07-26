// Serverless function for chat endpoint
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

// Import the OpenAI utility with proper path resolution
let openaiUtilPath;
try {
  // Try to resolve the path for Vercel production environment
  openaiUtilPath = require.resolve('../../utils/openai');
} catch (error) {
  // Fallback for Vercel environment
  openaiUtilPath = path.join(process.cwd(), 'utils', 'openai.js');
}

const { generateChatCompletion } = require(openaiUtilPath);

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
    const { messages, model, temperature, maxTokens } = req.body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Messages array is required and must not be empty'
      });
    }
    
    // Validate message format
    const validMessages = messages.every(msg => 
      msg.role && msg.content && 
      typeof msg.role === 'string' && 
      typeof msg.content === 'string'
    );
    
    if (!validMessages) {
      return res.status(400).json({
        success: false,
        message: 'Each message must have a role and content'
      });
    }
    
    const result = await generateChatCompletion(messages, {
      model,
      temperature, 
      maxTokens
    });
    
    if (result.success) {
      return res.json({
        success: true,
        result: {
          choices: [{
            message: {
              content: result.text
            }
          }]
        }
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Error generating chat completion',
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
