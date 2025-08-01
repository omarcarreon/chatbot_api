// Validation utilities for the chatbot API
import { DEBATE_PATTERNS } from './constants';

/**
 * Validates the debate format: "Debate: [topic]. Take side: [stance]"
 * @param {string} message - The message to validate
 * @returns {object} Validation result with isValid, error, example, and parsed data
 */
function validateDebateFormat(message) {
    const topicMatch = message.match(DEBATE_PATTERNS.TOPIC);
    const stanceMatch = message.match(DEBATE_PATTERNS.STANCE);
    
    if (!topicMatch || !stanceMatch) {
      return {
        isValid: false,
        error: 'Invalid format. Please use: "Debate: [topic]. Take side: [stance]"',
        example: 'Debate: Artificial intelligence will replace all human jobs. Take side: you agree',
        format: 'Debate: [topic]. Take side: [stance]'
      };
    }
    
    const topic = topicMatch[1].trim();
    const stance = stanceMatch[1].trim();
    
    if (!topic || !stance) {
      return {
        isValid: false,
        error: 'Topic and stance cannot be empty. Please provide both.',
        example: 'Debate: Artificial intelligence will replace all human jobs. Take side: you agree',
        format: 'Debate: [topic]. Take side: [stance]'
      };
    }
    
    return {
      isValid: true,
      error: null,
      topic,
      stance
    };
  }
  
  module.exports = {
    validateDebateFormat,
  };