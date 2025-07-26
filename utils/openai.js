// OpenAI service for making LLM API calls
const OpenAI = require('openai');
require('dotenv').config();

// Initialize OpenAI client with API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate a completion using OpenAI's API
 * 
 * @param {string} prompt - The prompt to send to the model
 * @param {Object} options - Configuration options
 * @param {string} options.model - The model to use (default: gpt-3.5-turbo)
 * @param {number} options.temperature - Controls randomness (0-2, default: 0.7)
 * @param {number} options.maxTokens - Maximum number of tokens to generate (default: 500)
 * @returns {Promise<Object>} - OpenAI API response
 */
async function generateCompletion(prompt, options = {}) {
  try {
    const defaultOptions = {
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 500,
    };

    // Merge default options with provided options
    const settings = { ...defaultOptions, ...options };
    
    const response = await openai.chat.completions.create({
      model: settings.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: settings.temperature,
      max_tokens: settings.maxTokens,
    });

    return {
      success: true,
      data: response,
      text: response.choices[0]?.message?.content || '',
    };
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return {
      success: false,
      error: {
        message: error.message,
        code: error.code || 'UNKNOWN_ERROR',
      },
    };
  }
}

/**
 * Generate a chat completion with multiple messages using OpenAI's API
 * 
 * @param {Array<Object>} messages - Array of message objects with role and content
 * @param {Object} options - Configuration options
 * @param {string} options.model - The model to use (default: gpt-3.5-turbo)
 * @param {number} options.temperature - Controls randomness (0-2, default: 0.7)
 * @param {number} options.maxTokens - Maximum number of tokens to generate (default: 500)
 * @returns {Promise<Object>} - OpenAI API response
 */
async function generateChatCompletion(messages, options = {}) {
  try {
    const defaultOptions = {
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 500,
    };

    // Merge default options with provided options
    const settings = { ...defaultOptions, ...options };

    const response = await openai.chat.completions.create({
      model: settings.model,
      messages: messages,
      temperature: settings.temperature,
      max_tokens: settings.maxTokens,
    });

    return {
      success: true,
      data: response,
      text: response.choices[0]?.message?.content || '',
    };
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return {
      success: false,
      error: {
        message: error.message,
        code: error.code || 'UNKNOWN_ERROR',
      },
    };
  }
}

module.exports = {
  generateCompletion,
  generateChatCompletion,
};
