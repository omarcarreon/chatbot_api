const axios = require('axios');

const HF_API_URL = 'https://router.huggingface.co/v1/chat/completions';
const HF_API_TOKEN = process.env.HF_API_TOKEN || '';

const headers = {
  Authorization: `Bearer ${HF_API_TOKEN}`,
  'Content-Type': 'application/json'
};

const conversationTopics = {}; // { convoId: { topic: string, stance: string } }

function extractTopicAndStance(initialMessage) {
  // Fixed expected parser: "Debate: [topic]. Take side: [stance]"
  const topicMatch = initialMessage.match(/Debate:\s*(.*?)\.?\s*Take side:/i);
  const stanceMatch = initialMessage.match(/Take side:\s*(.*)/i);
  return {
    topic: topicMatch ? topicMatch[1].trim() : 'Topic not found',
    stance: stanceMatch ? stanceMatch[1].trim() : 'Stance not found'
  };
}

function registerConversation(convoId, initialMessage) {
  const { topic, stance } = extractTopicAndStance(initialMessage);
  conversationTopics[convoId] = { topic, stance };
}

function getConversationContext(convoId) {
  return conversationTopics[convoId] || null;
}

async function generateReply(history, convoId) {
  const context = getConversationContext(convoId);
  const prompt = buildPrompt(history, context);

  try {
    const response = await axios.post(
      HF_API_URL,
      {
        model: "deepseek-ai/DeepSeek-V3-0324",
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

function buildPrompt(history, context) {
  let prompt = `You are debating about: ${context.topic}\n`;
  prompt += `Your stance: ${context.stance}\n`;
  prompt += `Your job is to persuade the user with rational or emotional arguments (without being overly argumentative).\n`;
  prompt += `IMPORTANT: Always respond in English only. Keep your response short and concise.\n`;
  prompt += `RESPONSE STYLE: Provide simple, conversational arguments. Avoid formatting, bullet points, lists, or numbered items. Write in a natural, flowing conversation style.\n\n`;

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
