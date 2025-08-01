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

/**
 * Handle full prompt request - takes the entire prompt configuration directly
 * @param {Object} requestData - The entire request data to be passed to the OpenAI API
 * @returns {Promise<Object>} - Result object with success status and response data
 */
async function handleFullPromptRequest(requestData) {
  // Input validation
  if (!requestData) {
    return {
      success: false,
      statusCode: 400,
      message: 'Request data is required'
    };
  }
  
  try {
    // Validate if the request contains minimal required OpenAI parameters
    if (!requestData.model) {
      return {
        success: false,
        statusCode: 400,
        message: 'Model parameter is required'
      };
    }
    
    // Support both a simple prompt string or a full messages array
    let messages = [];
    
    if (requestData.prompt && typeof requestData.prompt === 'string') {
      // If a simple prompt string is provided, convert it to a messages array
      messages = [{ role: 'user', content: requestData.prompt }];
    } else if (requestData.messages && Array.isArray(requestData.messages) && requestData.messages.length > 0) {
      // Use the provided messages array
      messages = requestData.messages;
    } else {
      return {
        success: false,
        statusCode: 400,
        message: 'Either a prompt string or messages array is required'
      };
    }

    // Call OpenAI with the messages
    const { generateChatCompletion } = require('../utils/openai');
    
    const result = await generateChatCompletion(messages, {
      model: requestData.model,
      temperature: requestData.temperature,
      maxTokens: requestData.max_tokens || requestData.maxTokens
      // Pass any other parameters that might be in the request
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
            }],
            raw_response: result.data // Include the raw response for full access
          }
        }
      };
    } else {
      return {
        success: false,
        statusCode: 500,
        message: 'Error generating completion with full prompt',
        error: result.error
      };
    }
  } catch (error) {
    console.error('Full Prompt LLM API Error:', error);
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
  handleSimplePromptRequest,
  handleFullPromptRequest
};
