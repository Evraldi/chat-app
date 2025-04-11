const logger = require('../utils/logger');

/**
 * Global error handling middleware for Express
 */
function handleError(err, req, res, next) {
  logger.error(`Global error handler: ${err.message}`, { stack: err.stack });
  res.status(500).json({ success: false, message: 'Internal Server Error' });
}

/**
 * Utility function for handling errors in route handlers
 * @param {Object} res - Express response object
 * @param {Error} error - Error object
 * @param {String} message - Custom error message
 */
function handleRouteError(res, error, message) {
  logger.error(`${message}: ${error.message}`, { stack: error.stack });
  res.status(500).json({ success: false, message: message || 'Internal Server Error' });
}

module.exports = { handleError, handleRouteError };
