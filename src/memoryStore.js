const { v4: uuidv4 } = require('uuid');

const conversations = {}; // { conversation_id: [ { role, message }, ... ] }

function createConversation(initialMessage) {
  const id = uuidv4();
  conversations[id] = [
    { role: 'user', message: initialMessage },
  ];
  return id;
}

function appendMessage(convoId, msgObj) {
  if (conversations[convoId]) {
    conversations[convoId].push(msgObj);
  }
}

function getHistory(convoId) {
  return conversations[convoId] || null;
}

function getTrimmedHistory(convoId) {
  const history = getHistory(convoId);
  if (!history) return [];
  // Get last 5 pairs (10 messages max)
  return history.slice(-10);
}

module.exports = {
  createConversation,
  appendMessage,
  getHistory,
  getTrimmedHistory,
};
