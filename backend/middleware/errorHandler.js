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

module.exports = { handleError };
