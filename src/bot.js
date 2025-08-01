/**
 * Bot Service for Chatbot API
 * 
 * Handles AI integration and debate conversation logic.
 * Provides functions for conversation registration and AI response generation.
 * 
 * @module bot
 * @version 1.0.0
 */

const axios = require('axios');
const cache = require('./cache.js');
const { validateDebateFormat } = require('./utils/validators.js');

// AI API configuration
const HF_API_URL = 'https://router.huggingface.co/v1/chat/completions';
const HF_API_TOKEN = process.env.HF_API_TOKEN || '';
const HF_MODEL = 'deepseek-ai/DeepSeek-V3-0324';

const headers = {
  Authorization: `Bearer ${HF_API_TOKEN}`,
  'Content-Type': 'application/json'
};

/**
 * Extracts topic and stance from debate format message
 * 
 * @param {string} initialMessage - The debate message in format "Debate: [topic]. Take side: [stance]"
 * @returns {Object} Object containing topic and stance
 * @returns {string} returns.topic - The debate topic
 * @returns {string} returns.stance - The debate stance
 */
function extractTopicAndStance(initialMessage) {
  const validation = validateDebateFormat(initialMessage);
  
  if (validation.isValid) {
    const { topic, stance } = validation;
    return { topic, stance };
  }
  
  return {
    topic: 'Topic not found',
    stance: 'Stance not found'
  };
}

/**
 * Registers a new conversation with topic and stance in cache
 * 
 * @param {string} convoId - Unique conversation identifier
 * @param {string} initialMessage - The debate message to parse
 * @returns {Promise<void>}
 */
async function registerConversation(convoId, initialMessage) {
  const { topic, stance } = extractTopicAndStance(initialMessage);
  await cache.setConversationTopic(convoId, topic, stance);
}

/**
 * Retrieves conversation context (topic and stance) from cache
 * 
 * @param {string} convoId - Unique conversation identifier
 * @returns {Promise<Object|null>} Conversation context or null if not found
 */
async function getConversationContext(convoId) {
  return await cache.getConversationTopic(convoId);
}

/**
 * Generates AI response for debate conversation
 * 
 * @param {Array} history - Conversation history array
 * @param {string} convoId - Unique conversation identifier
 * @returns {Promise<string>} AI generated response
 * @throws {Error} Handles error when AI API call fails
 */
async function generateReply(history, convoId) {
  const context = await getConversationContext(convoId);
  const prompt = buildPrompt(history, context);

  try {
    const response = await axios.post(
      HF_API_URL,
      {
        model: HF_MODEL,
        messages: [
          { role: "user", content: prompt }
        ],
        temperature: 0.7
      },
      { headers }
    );
    
    const generated = response.data?.choices?.[0]?.message?.content || 'Sorry, I don\'t know what to say but I\'m sure you\'re wrong.';
    return generated.trim();
  } catch (err) {
    return 'Sorry, I don\'t know what to say but I\'m sure you\'re wrong.';
  }
}

/**
 * Builds the prompt for AI generation based on conversation context
 * 
 * @param {Array} history - Conversation history array
 * @param {Object} context - Debate topic and stance context
 * @returns {string} Formatted prompt for AI
 */
function buildPrompt(history, context) {
  // Start prompt with debate context
  let prompt = `You are debating about: ${context.topic}\n`;
  prompt += `Your stance: ${context.stance}\n`;
  prompt += `Your job is to persuade the user with rational or emotional arguments (without being overly argumentative).\n`;
  prompt += `IMPORTANT: Always respond in English only. Keep your response short and concise (max 50 words). Keep coherent with the conversation history. Do not repeat yourself.\n`;
  prompt += `RESPONSE STYLE: Provide simple, conversational arguments. Avoid formatting, bullet points, lists, or numbered items. Write in a natural, flowing conversation style.\n\n`;

  // Add whole conversation history to the prompt
  history.forEach(entry => {
    prompt += `${entry.role === 'user' ? 'User' : 'Bot'}: ${entry.message}\n`;
  });
  prompt += 'Bot:';

  return prompt;
}

module.exports = {
  registerConversation,
  generateReply
};
