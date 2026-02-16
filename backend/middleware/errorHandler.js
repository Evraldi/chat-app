const logger = require('../utils/logger');

/**
 * Global error handling middleware for Express
 */
function handleError(err, req, res, next) {
  logger.error(`Global error handler: ${err.message}`, { stack: err.stack, url: req.url, method: req.method });

  // Return detailed error in development, generic in production
  const isDevelopment = process.env.NODE_ENV !== 'production';

  res.status(err.status || 500).json({
    success: false,
    message: isDevelopment ? err.message : 'Internal Server Error',
    ...(isDevelopment && { stack: err.stack })
  });
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
