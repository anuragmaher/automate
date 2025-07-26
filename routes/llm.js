// LLM API routes with simple API key authentication
const express = require('express');
const router = express.Router();
const authenticateApiKey = require('../middleware/simple-auth');
const { generateCompletion, generateChatCompletion } = require('../utils/openai');

/**
 * POST /api/llm/completion
 * Generate a completion using OpenAI's API
 * Protected by API key authentication
 */
router.post('/completion', authenticateApiKey, async (req, res) => {
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
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * POST /api/llm/chat
 * Generate a chat completion using OpenAI's API
 * Protected by API key authentication
 */
router.post('/chat', authenticateApiKey, async (req, res) => {
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
        completion: result.text,
        data: result.data
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
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * POST /api/llm/simple-prompt
 * A simpler endpoint for quick prompts
 * Also protected by API key authentication
 */
router.post('/simple-prompt', authenticateApiKey, async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required'
      });
    }
    
    // Using default parameters for simplicity
    const result = await generateCompletion(prompt);
    
    if (result.success) {
      return res.json({
        success: true,
        completion: result.text
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Error generating completion',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Simple LLM API Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
