/**
 * API Routes for Chatbot API
 * 
 * Handles HTTP endpoints for debate conversations.
 * Provides POST /api/debate for starting and continuing conversations.
 * 
 * @module routes
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();
const cache = require('./cache.js');
const bot = require('./bot.js');
const { validateDebateFormat } = require('./utils/validators.js');

/**
 * @openapi
 * /api/debate:
 *   post:
 *     summary: Start or continue a debate conversation.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               conversation_id:
 *                 type: string
 *                 nullable: true
 *                 description: Conversation ID (omit or null to start a new one)
 *               message:
 *                 type: string
 *                 description: "The debate message. Format: 'Debate: [topic]. Take side: [stance]'"
 *             required:
 *               - message
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Conversation not found
 */
router.post('/debate', async (req, res) => {
  const { conversation_id, message } = req.body;

  // Validate required message parameter
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required and must be a string.' });
  }

  // Start a new conversation
  let convoId = conversation_id;
  let history = null;

  // If no conversation ID provided, start a new conversation
  if (!convoId) {
    // Validate debate format for new conversations
    const validation = validateDebateFormat(message);
    if (!validation.isValid) {
      return res.status(400).json({
        error: validation.error,
        example: validation.example,
        format: 'Debate: [topic]. Take side: [stance]'
      });
    }

    // Generate new conversation ID
    convoId = require('uuid').v4();
    await cache.createConversation(convoId, message);
    await bot.registerConversation(convoId, message);
    history = await cache.getConversationHistory(convoId);
  } else {
    // Check if conversation exists before appending
    history = await cache.getConversationHistory(convoId);
    if (!history) {
      return res.status(404).json({ error: 'Conversation not found.' });
    }
    
    // Append user message to existing conversation
    await cache.appendToHistory(convoId, { role: 'user', message });
  }

  // Generate AI response and append to conversation history
  const botReply = await bot.generateReply(history, convoId);
  await cache.appendToHistory(convoId, { role: 'bot', message: botReply });

  // Return trimmed conversation history (using default maxMessages of 10)
  const trimmedHistory = await cache.getTrimmedHistory(convoId);

  // Send response with conversation ID and trimmed history
  res.json({
    conversation_id: convoId,
    message: trimmedHistory
  });
});

/**
 * Health check endpoint
 * 
 * @openapi
 * /:
 *   get:
 *     summary: Health check endpoint
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', (req, res) => {
  res.send('Chatbot API is running. Use POST /api/debate');
});

module.exports = router;
