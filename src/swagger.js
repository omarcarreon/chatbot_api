const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Chatbot API',
      version: '1.0.0',
      description: 'Simple API for debate chatbot',
    },
    components: {
      securitySchemes: {
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
          description: 'Enter your API key in the format: your-api-key. The API key value is the same value as the API_KEY variable in the .env file'
        }
      }
    },
    security: [
      {
        apiKeyAuth: []
      }
    ]
  },
  apis: ['./src/routes.js'],
};

module.exports = swaggerJSDoc(options);