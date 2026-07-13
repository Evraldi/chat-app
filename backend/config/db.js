const mongoose = require('mongoose');
const logger = require('../utils/logger');

let retryCount = 0;
const MAX_RETRIES = 5;
let retryTimer = null;

/**
 * Connect to MongoDB database
 * @returns {Promise} Mongoose connection promise
 */
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not set');
    }

    await mongoose.connect(process.env.MONGO_URI);
    logger.info('MongoDB connected successfully');
    retryCount = 0;
    if (retryTimer) {
      clearTimeout(retryTimer);
      retryTimer = null;
    }
    return mongoose.connection;
  } catch (err) {
    logger.error(`MongoDB connection error: ${err.message}`, { stack: err.stack });

    // Exit process with failure in production
    if (process.env.NODE_ENV === 'production') {
      logger.error('Exiting application due to database connection failure');
      process.exit(1);
    } else if (retryCount < MAX_RETRIES) {
      // Retry connection in development with limit
      retryCount++;
      logger.info(`Retrying connection (${retryCount}/${MAX_RETRIES}) in 5 seconds...`);
      retryTimer = setTimeout(connectDB, 5000);
    } else {
      logger.error(`Failed to connect to database after ${MAX_RETRIES} retries. Giving up.`);
    }
  }
};

module.exports = connectDB;
