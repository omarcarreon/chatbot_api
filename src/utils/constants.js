const DEBATE_PATTERNS = {
    TOPIC: /Debate:\s*(.*?)\.?\s*Take side:/i,
    STANCE: /Take side:\s*(.*)/i,
    FULL_FORMAT: /Debate:\s*(.*?)\.?\s*Take side:\s*(.*)/i
  };

module.exports = {
    DEBATE_PATTERNS
};