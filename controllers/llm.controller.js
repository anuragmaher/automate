/**
 * LLM Controller
 * Shared logic for LLM operations used by both Express routes and Vercel serverless functions
 */

const { generateCompletion, generateChatCompletion } = require('../utils/openai');

/**
 * Handle completion request
 * @param {Object} requestData - The request data (prompt, model, temperature, maxTokens)
 * @returns {Promise<Object>} - Result object with success status and response data
 */
async function handleCompletionRequest(requestData) {
  const { prompt, model, temperature, maxTokens } = requestData;
  
  // Input validation
  if (!prompt) {
    return {
      success: false,
      statusCode: 400,
      message: 'Prompt is required'
    };
  }
  
  try {
    const result = await generateCompletion(prompt, {
      model,
      temperature, 
      maxTokens
    });
    
    if (result.success) {
      return {
        success: true,
        statusCode: 200,
        data: {
          success: true,
          completion: result.text,
          result: {
            text: result.text,
            choices: [{
              text: result.text
            }]
          }
        }
      };
    } else {
      return {
        success: false,
        statusCode: 500,
        message: 'Error generating completion',
        error: result.error
      };
    }
  } catch (error) {
    console.error('LLM API Error:', error);
    return {
      success: false,
      statusCode: 500,
      message: 'Server error',
      error: error.message
    };
  }
}

/**
 * Handle chat completion request
 * @param {Object} requestData - The request data (messages, model, temperature, maxTokens)
 * @returns {Promise<Object>} - Result object with success status and response data
 */
async function handleChatCompletionRequest(requestData) {
  const { messages, model, temperature, maxTokens } = requestData;
  
  // Input validation
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return {
      success: false,
      statusCode: 400,
      message: 'Messages array is required and must not be empty'
    };
  }
  
  // Validate message format
  const validMessages = messages.every(msg => 
    msg.role && msg.content && 
    typeof msg.role === 'string' && 
    typeof msg.content === 'string'
  );
  
  if (!validMessages) {
    return {
      success: false,
      statusCode: 400,
      message: 'Each message must have a role and content'
    };
  }
  
  try {
    const result = await generateChatCompletion(messages, {
      model,
      temperature, 
      maxTokens
    });
    
    if (result.success) {
      return {
        success: true,
        statusCode: 200,
        data: {
          success: true,
          completion: result.text,
          result: {
            choices: [{
              message: {
                content: result.text
              }
            }]
          }
        }
      };
    } else {
      return {
        success: false,
        statusCode: 500,
        message: 'Error generating chat completion',
        error: result.error
      };
    }
  } catch (error) {
    console.error('LLM API Error:', error);
    return {
      success: false,
      statusCode: 500,
      message: 'Server error',
      error: error.message
    };
  }
}

/**
 * Handle simple prompt request
 * @param {Object} requestData - The request data (prompt)
 * @returns {Promise<Object>} - Result object with success status and response data
 */
async function handleSimplePromptRequest(requestData) {
  const { prompt } = requestData;
  
  // Input validation
  if (!prompt) {
    return {
      success: false,
      statusCode: 400,
      message: 'Prompt is required'
    };
  }
  
  try {
    // Using default parameters for simplicity
    const result = await generateCompletion(prompt);
    
    if (result.success) {
      return {
        success: true,
        statusCode: 200,
        data: {
          success: true,
          completion: result.text,
          result: {
            text: result.text,
            choices: [{
              text: result.text
            }]
          }
        }
      };
    } else {
      return {
        success: false,
        statusCode: 500,
        message: 'Error generating completion',
        error: result.error
      };
    }
  } catch (error) {
    console.error('Simple LLM API Error:', error);
    return {
      success: false,
      statusCode: 500,
      message: 'Server error',
      error: error.message
    };
  }
}

module.exports = {
  handleCompletionRequest,
  handleChatCompletionRequest,
  handleSimplePromptRequest
};
