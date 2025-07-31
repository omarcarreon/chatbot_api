const express = require('express');
const router = express.Router();
const memoryStore = require('./memoryStore.js');


router.post('/debate', (req, res) => {
  const { conversation_id, message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required and must be a string.' });
  }

  // Start a new conversation
  let convoId = conversation_id;
  if (!convoId) {
    convoId = memoryStore.createConversation(message);
  } else {
    memoryStore.appendMessage(convoId, { role: 'user', message });
  }

  const history = memoryStore.getHistory(convoId);
  if (!history) {
    return res.status(404).json({ error: 'Conversation not found.' });
  }

  // TODO: IMPLEMENT BOT REPLY LOGIC
  memoryStore.appendMessage(convoId, { role: 'bot', message: 'bot reply' }); // TODO: SAVE BOT REPLY

  const trimmedHistory = memoryStore.getTrimmedHistory(convoId);

  res.json({
    conversation_id: convoId,
    message: trimmedHistory
  });
});

module.exports = router;
