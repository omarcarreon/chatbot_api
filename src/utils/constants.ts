// Constants for the debate input format patterns
const DEBATE_PATTERNS = {
    TOPIC: /Debate:\s*(.*?)\.?\s*Take side:/i,
    STANCE: /Take side:\s*(.*)/i,
  };

module.exports = {
    DEBATE_PATTERNS
};