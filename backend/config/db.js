const mongoose = require('mongoose');
const logger = require('../utils/logger');

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
    return mongoose.connection;
  } catch (err) {
    logger.error(`MongoDB connection error: ${err.message}`, { stack: err.stack });

    // Exit process with failure in production
    if (process.env.NODE_ENV === 'production') {
      logger.error('Exiting application due to database connection failure');
      process.exit(1);
    } else {
      // Retry connection in development
      logger.info('Retrying connection in 5 seconds...');
      setTimeout(connectDB, 5000);
    }
  }
};

module.exports = connectDB;
