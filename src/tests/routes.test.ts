import request from 'supertest';
import axios from 'axios';

jest.mock('axios');

import app from '../app';
import cache from '../cache';

describe('API Endpoints', () => {
  beforeEach(async () => {
    // Clear cache before each test
    await cache.clearAllCache();
    
    // Reset all mocks
    jest.clearAllMocks();
  });

  afterAll(async () => {
    // Cleanup after all tests
    await cache.clearAllCache();
    await cache.closeConnection();
  });

  describe('GET /api', () => {
    it('should return API status message', async () => {
      const response = await request(app).get('/api');
      
      expect(response.status).toBe(200);
      expect(response.text).toContain('Chatbot API is running');
    });
  });

  describe('POST /api/debate', () => {
    beforeEach(() => {
      // Mock successful API response
      axios.post.mockResolvedValue({
        data: {
          choices: [{
            message: {
              content: 'This is a mock response from the AI.'
            }
          }]
        }
      });
    });

    it('should create new conversation with valid format', async () => {
      const response = await request(app)
        .post('/api/debate')
        .send({
          message: 'Debate: The Earth is flat. Take side: You agree'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.conversation_id).toBeDefined();
      expect(response.body.message).toBeInstanceOf(Array);
      expect(response.body.message.length).toBe(2);
      expect(axios.post).toHaveBeenCalledTimes(1);
    });

    it('should reject invalid debate format', async () => {
      const response = await request(app)
        .post('/api/debate')
        .send({
          message: 'Let\'s talk about AI'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid format');
      expect(response.body.example).toBeDefined();
      expect(response.body.format).toBeDefined();
      
      // Verify API was NOT called when invalid format
      expect(axios.post).not.toHaveBeenCalled();
    });

    it('should reject empty message', async () => {
      const response = await request(app)
        .post('/api/debate')
        .send({
          message: ''
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Message is required and must be a string');
    });

    it('should reject missing message', async () => {
      const response = await request(app)
        .post('/api/debate')
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Message is required and must be a string');
    });

    it('should reject non-string message', async () => {
      const response = await request(app)
        .post('/api/debate')
        .send({
          message: 123
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Message is required and must be a string');
    });

    it('should continue existing conversation', async () => {
      // First request - create conversation
      const firstResponse = await request(app)
        .post('/api/debate')
        .send({
          message: 'Debate: The Earth is flat. Take side: You agree'
        });
      
      expect(firstResponse.status).toBe(200);
      const convoId = firstResponse.body.conversation_id;
      
      // Second request - continue conversation
      const secondResponse = await request(app)
        .post('/api/debate')
        .send({
          conversation_id: convoId,
          message: 'But there is evidence that proves the Earth is round'
        });
      
      expect(secondResponse.status).toBe(200);
      expect(secondResponse.body.conversation_id).toBe(convoId);
      expect(secondResponse.body.message.length).toBe(4);
      expect(axios.post).toHaveBeenCalledTimes(2);
    });

    it('should return 404 for non-existent conversation', async () => {
      const response = await request(app)
        .post('/api/debate')
        .send({
          conversation_id: 'non-existent-id',
          message: 'Hello'
        });
      
      expect(response.status).toBe(404);
      expect(response.body.error).toContain('Conversation not found');
    });

    it('should handle various valid debate topics', async () => {
      const validTopics = [
        'Debate: Remote work. Take side: You agree that remote work increases productivity',
        'Debate: Electric cars. Take side: You agree that electric cars are better for the environment',
        'Debate: Social media. Take side: You agree that social media connects people globally'
      ];

      for (const topic of validTopics) {
        const response = await request(app)
          .post('/api/debate')
          .send({ message: topic });
        
        expect(response.status).toBe(200);
        expect(response.body.conversation_id).toBeDefined();
      }
      
      // Verify API was called for each valid topic
      expect(axios.post).toHaveBeenCalledTimes(validTopics.length);
    });
  });
});
