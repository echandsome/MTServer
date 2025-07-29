const constants = require('../config/contants');
const logger = require('../utils/logger');

const validateApiKey = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    logger.warn('Auth failed: missing header');
    return res.status(401).json({
      success: false,
      error: 'Authorization header is required'
    });
  }

  const token = authHeader.replace('Bearer ', '');
  
  if (!token) {
    logger.warn('Auth failed: empty key');
    return res.status(401).json({
      success: false,
      error: 'API key is required'
    });
  }

  if (token !== constants.API_Key) {
    logger.warn('Auth failed: invalid key');
    return res.status(403).json({
      success: false,
      error: 'Invalid API key'
    });
  }

  next();
};

module.exports = {
  validateApiKey
}; 