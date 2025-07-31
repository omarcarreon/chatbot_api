const express = require('express');
const router = express.Router();
const memoryStore = require('./memoryStore.js');
const bot = require('./bot.js');

router.get('/', (req, res) => {
  res.send('Chatbot API is running. Use POST /api/debate');
});

router.post('/debate', async (req, res) => {
  const { conversation_id, message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required and must be a string.' });
  }

  // Start a new conversation
  let convoId = conversation_id;
  if (!convoId) {
    convoId = memoryStore.createConversation(message);
    bot.registerConversation(convoId, message);
  } else {
    memoryStore.appendMessage(convoId, { role: 'user', message });
  }

  const history = memoryStore.getHistory(convoId);
  if (!history) {
    return res.status(404).json({ error: 'Conversation not found.' });
  }

  const botReply = await bot.generateReply(history, message, convoId);
  memoryStore.appendMessage(convoId, { role: 'bot', message: botReply });

  const trimmedHistory = memoryStore.getTrimmedHistory(convoId);

  res.json({
    conversation_id: convoId,
    message: trimmedHistory
  });
});

module.exports = router;
