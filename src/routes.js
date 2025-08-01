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
const { simpleAuth } = require('./middleware/simpleAuth.js');

/**
 * @openapi
 * /api/debate:
 *   post:
 *     summary: Start or continue a debate conversation.
 *     security:
 *       - apiKeyAuth: []
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
 *           examples:
 *             new_debate:
 *               summary: Start a new debate
 *               value:
 *                 message: "Debate: The earth is flat. Take side: You agree that the earth is flat."
 *             continue_debate:
 *               summary: Continue an existing debate
 *               value:
 *                 conversation_id: "123e4567-e89b-12d3-a456-426614174000"
 *                 message: "But what about the scientific evidence that proves the earth is round?"
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             example:
 *               conversation_id: "123e4567-e89b-12d3-a456-426614174000"
 *               message: [
 *                 {"role": "user", "message": "Debate: The earth is flat. Take side: Yes"},
 *                 {"role": "bot", "message": "I'll argue in favor of the earth being flat..."}
 *               ]
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             example:
 *               error: "Invalid format. Please use: 'Debate: [topic]. Take side: [stance]'"
 *               example: "Debate: The earth is flat. Take side: Yes"
 *               format: "Debate: [topic]. Take side: [stance]"
 *       401:
 *         description: Unauthorized - API key required
 *         content:
 *           application/json:
 *             example:
 *               error: "Invalid API key. Use header: x-api-key"
 *       404:
 *         description: Conversation not found
 *         content:
 *           application/json:
 *             example:
 *               error: "Conversation not found."
 */
router.post('/debate', simpleAuth, async (req, res) => {
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

module.exports = router;
