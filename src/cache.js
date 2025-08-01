/**
 * Cache Service for Chatbot API
 * 
 * Handles Redis operations for conversation storage and retrieval.
 * Provides functions for topic/stance caching and conversation history.
 * 
 * @module cache
 * @version 1.0.0
 */

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

// ============================================================================
// TOPIC AND STANCE FUNCTIONS
// ============================================================================

/**
 * Stores conversation topic and stance in Redis cache
 * 
 * @param {string} convoId - Unique conversation identifier
 * @param {string} topic - Debate topic
 * @param {string} stance - Debate stance
 * @returns {Promise<void>}
 * @throws {Error} When Redis operation fails
 */
async function setConversationTopic(convoId, topic, stance) {
  const key = TOPIC_KEY_PREFIX + convoId;
  const data = JSON.stringify({ topic, stance });
  await client.setEx(key, TTL, data);
}

/**
 * Retrieves conversation topic and stance from Redis cache
 * 
 * @param {string} convoId - Unique conversation identifier
 * @returns {Promise<Object|null>} Topic and stance object or null if not found
 */
async function getConversationTopic(convoId) {
  const key = TOPIC_KEY_PREFIX + convoId;
  const data = await client.get(key);
  return data ? JSON.parse(data) : null;
}

// ============================================================================
// CONVERSATION HISTORY FUNCTIONS
// ============================================================================

/**
 * Stores conversation history in Redis cache
 * 
 * @param {string} convoId - Unique conversation identifier
 * @param {Array} history - Array of conversation messages
 * @returns {Promise<void>}
 */
async function setConversationHistory(convoId, history) {
  const key = HISTORY_KEY_PREFIX + convoId;
  const data = JSON.stringify(history);
  await client.setEx(key, TTL, data);
}

/**
 * Retrieves conversation history from Redis cache
 * 
 * @param {string} convoId - Unique conversation identifier
 * @returns {Promise<Array|null>} Conversation history array or null if not found
 */
async function getConversationHistory(convoId) {
  const key = HISTORY_KEY_PREFIX + convoId;
  const data = await client.get(key);
  return data ? JSON.parse(data) : null;
}

/**
 * Appends a new message to conversation history
 * 
 * @param {string} convoId - Unique conversation identifier
 * @param {Object} messageObj - Message object with role and message properties
 * @returns {Promise<Array>} Updated conversation history
 */
async function appendToHistory(convoId, messageObj) {
  let history = await getConversationHistory(convoId) || [];
  history.push(messageObj);
  await setConversationHistory(convoId, history);
  return history;
}

/**
 * Creates a new conversation with initial message
 * 
 * @param {string} convoId - Unique conversation identifier
 * @param {string} initialMessage - The first message to start the conversation
 * @returns {Promise<Array>} The conversation history array
 */
async function createConversation(convoId, initialMessage) {
  const history = [{ role: 'user', message: initialMessage }];
  await setConversationHistory(convoId, history);
  return history;
}

// ============================================================================
// CLEANUP FUNCTIONS
// ============================================================================

/**
 * Retrieves trimmed conversation history (last N messages)
 * 
 * @param {string} convoId - Unique conversation identifier
 * @param {number} maxMessages - Maximum number of messages to return (default: 10)
 * @returns {Promise<Array>} Trimmed conversation history
 */
async function getTrimmedHistory(convoId, maxMessages = 10) {
  const history = await getConversationHistory(convoId);
  if (!history) return [];
  return history.slice(-maxMessages);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Clears all data from Redis cache
 * 
 * @returns {Promise<void>}
 */
async function clearAllCache() {
  await client.flushAll();
}

/**
 * Closes Redis connection
 * 
 * @returns {Promise<void>}
 */
async function closeConnection() {
  await client.quit();
}

module.exports = {
  setConversationTopic,
  getConversationTopic,
  setConversationHistory,
  getConversationHistory,
  appendToHistory,
  createConversation,
  getTrimmedHistory,
  clearAllCache,
  closeConnection
}; 