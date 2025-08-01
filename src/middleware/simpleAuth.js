/**
 * @module middleware/simpleAuth
 * @version 1.0.0
 */

/**
 * Simple authentication middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const simpleAuth = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey || apiKey !== process.env.API_KEY) {
      return res.status(401).json({ 
        error: 'Invalid API key. Use header: x-api-key'
      });
    }
    
    next();
  };
  
  module.exports = { simpleAuth };