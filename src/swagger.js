import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Chatbot API',
      version: '1.0.0',
      description: 'Simple API for debate chatbot',
    },
  },
  apis: ['./src/routes.ts'],
};

export default swaggerJSDoc(options);