require('dotenv').config();
const express = require('express');
const routes = require('./routes.js');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const app = express();
app.use(express.json());

/**
 * Health check endpoint
 * 
 * @openapi
 * /:
 *   get:
 *     summary: Health check endpoint
 *     responses:
 *       200:
 *         description: Success
 */
app.get('/', (req, res) => {
  res.json({
    message: 'Chatbot API is running',
    endpoints: {
      debate: 'POST /api/debate',
      docs: 'GET /docs'
    },
    version: '1.0.0'
  });
});

app.use('/api', routes);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Only start server if this file is run directly
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
