// LLM API routes with simple API key authentication
const express = require('express');
const router = express.Router();
const authenticateApiKey = require('../middleware/simple-auth');
const LLMController = require('../controllers/llm.controller');

/**
 * POST /api/llm/completion
 * Generate a completion using OpenAI's API
 * Protected by API key authentication
 */
router.post('/completion', authenticateApiKey, async (req, res) => {
  const result = await LLMController.handleCompletionRequest(req.body);
  
  if (result.success) {
    return res.json(result.data);
  } else {
    return res.status(result.statusCode).json({
      success: false,
      message: result.message,
      error: result.error
    });
  }
});

/**
 * POST /api/llm/chat
 * Generate a chat completion using OpenAI's API
 * Protected by API key authentication
 */
router.post('/chat', authenticateApiKey, async (req, res) => {
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
});

/**
 * POST /api/llm/simple-prompt
 * A simpler endpoint for quick prompts
 * Also protected by API key authentication
 */
router.post('/simple-prompt', authenticateApiKey, async (req, res) => {
  const result = await LLMController.handleSimplePromptRequest(req.body);
  
  if (result.success) {
    return res.json(result.data);
  } else {
    return res.status(result.statusCode).json({
      success: false,
      message: result.message,
      error: result.error
    });
  }
});

module.exports = router;
