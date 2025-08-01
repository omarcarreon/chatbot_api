const { validateDebateFormat } = require('../utils/validators');

describe('Debate Format Validators', () => {
  describe('Valid formats', () => {
    it('should validate correct format with period', () => {
      const validMessage = 'Debate: Climate change. Take side: Renewable energy is the solution';
      const result = validateDebateFormat(validMessage);
      
      expect(result.isValid).toBe(true);
      expect(result.topic).toBe('Climate change');
      expect(result.stance).toBe('Renewable energy is the solution');
      expect(result.error).toBe(null);
    });

    it('should handle case insensitive format', () => {
      const validMessage = 'DEBATE: remote work. TAKE SIDE: remote work is better';
      const result = validateDebateFormat(validMessage);
      
      expect(result.isValid).toBe(true);
      expect(result.topic).toBe('remote work');
      expect(result.stance).toBe('remote work is better');
    });
  });

  describe('Invalid formats', () => {
    it('should reject missing debate keyword', () => {
      const invalidMessage = 'Climate change. Take side: Renewable energy is the solution';
      const result = validateDebateFormat(invalidMessage);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid format');
      expect(result.example).toBeDefined();
      expect(result.format).toBeDefined();
    });

    it('should reject missing take side keyword', () => {
      const invalidMessage = 'Debate: Climate change. Renewable energy is the solution';
      const result = validateDebateFormat(invalidMessage);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid format');
    });

    it('should reject empty topic', () => {
      const invalidMessage = 'Debate: . Take side: Renewable energy is the solution';
      const result = validateDebateFormat(invalidMessage);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('cannot be empty');
    });

    it('should reject empty stance', () => {
      const invalidMessage = 'Debate: Climate change. Take side: ';
      const result = validateDebateFormat(invalidMessage);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('cannot be empty');
    });

    it('should reject completely empty message', () => {
      const invalidMessage = '';
      const result = validateDebateFormat(invalidMessage);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid format');
    });
  });

  describe('Edge cases', () => {
    it('should handle special characters in topic and stance', () => {
      const validMessage = 'Debate: AI & ML. Take side: AI will change the world!';
      const result = validateDebateFormat(validMessage);
      
      expect(result.isValid).toBe(true);
      expect(result.topic).toBe('AI & ML');
      expect(result.stance).toBe('AI will change the world!');
    });
  });
}); 