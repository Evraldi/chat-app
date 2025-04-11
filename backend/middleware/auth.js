const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const { error } = require('../utils/responseHandler');

/**
 * Middleware to authenticate JWT tokens
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return error(res, 'Access denied. No token provided', 401);
  }
  
  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      logger.error('JWT_SECRET environment variable is not set');
      return error(res, 'Server configuration error', 500);
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return error(res, 'Token expired', 403);
    }
    return error(res, 'Invalid token', 403);
  }
};

module.exports = authenticateToken;
