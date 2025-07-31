const redis = require('redis');

// Redis client configuration
const client = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Connect to Redis
client.connect().catch(console.error);

// Handle connection events
client.on('error', (err) => console.error('Redis Client Error', err));
client.on('connect', () => console.log('Connected to Redis'));

// Cache keys
const TOPIC_KEY_PREFIX = 'conversation:topic:';
const HISTORY_KEY_PREFIX = 'conversation:history:';

// TTL in seconds (24 hours)
const TTL = 24 * 60 * 60;

// Topic and stance functions
async function setConversationTopic(convoId, topic, stance) {
  const key = TOPIC_KEY_PREFIX + convoId;
  const data = JSON.stringify({ topic, stance });
  await client.setEx(key, TTL, data);
}

async function getConversationTopic(convoId) {
  const key = TOPIC_KEY_PREFIX + convoId;
  const data = await client.get(key);
  return data ? JSON.parse(data) : null;
}

// Conversation History functions
async function setConversationHistory(convoId, history) {
  const key = HISTORY_KEY_PREFIX + convoId;
  const data = JSON.stringify(history);
  await client.setEx(key, TTL, data);
}

async function getConversationHistory(convoId) {
  const key = HISTORY_KEY_PREFIX + convoId;
  const data = await client.get(key);
  return data ? JSON.parse(data) : null;
}

async function appendToHistory(convoId, messageObj) {
  let history = await getConversationHistory(convoId) || [];
  history.push(messageObj);
  await setConversationHistory(convoId, history);
  return history;
}

async function createConversation(convoId, initialMessage) {
  const history = [{ role: 'user', message: initialMessage }];
  await setConversationHistory(convoId, history);
  return history;
}

// Cleanup functions
async function deleteConversation(convoId) {
  const topicKey = TOPIC_KEY_PREFIX + convoId;
  const historyKey = HISTORY_KEY_PREFIX + convoId;
  await client.del(topicKey, historyKey);
}

async function getTrimmedHistory(convoId, maxMessages = 10) {
  const history = await getConversationHistory(convoId);
  if (!history) return [];
  return history.slice(-maxMessages);
}

// Utility functions for monitoring
async function getCacheStats() {
  return await client.info('memory');
}

async function clearAllCache() {
  await client.flushAll();
}

module.exports = {
  setConversationTopic,
  getConversationTopic,
  setConversationHistory,
  getConversationHistory,
  appendToHistory,
  createConversation,
  deleteConversation,
  getTrimmedHistory,
  getCacheStats,
  clearAllCache
}; 