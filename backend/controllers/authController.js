const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');
const { success, error } = require('../utils/responseHandler');

/**
 * Register a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return error(res, 'Username and password are required', 400);
    }

    if (username.length < 3) {
      return error(res, 'Username must be at least 3 characters long', 400);
    }

    if (password.length < 6) {
      return error(res, 'Password must be at least 6 characters long', 400);
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return error(res, 'Username already exists', 400);
    }

    const role = username === 'evraldi' ? 'admin' : 'user';
    const user = new User({ username, password, role });
    await user.save();

    logger.info(`User registered: ${user._id}`, { username });
    return success(res, null, 'User registered successfully', 201);
  } catch (err) {
    logger.error(`Failed to register user: ${err.message}`, { stack: err.stack });
    return error(res, 'Failed to register user');
  }
};

/**
 * Login a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return error(res, 'Username and password are required', 400);
    }

    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return error(res, 'Invalid credentials', 401);
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      logger.error('JWT_SECRET environment variable is not set');
      return error(res, 'Server configuration error', 500);
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    logger.info(`User logged in: ${user._id}`, { username });
    return success(res, {
      token,
      id: user._id,
      username: user.username
    }, 'Login successful');
  } catch (err) {
    logger.error(`Failed to login user: ${err.message}`, { stack: err.stack });
    return error(res, 'Failed to login user');
  }
};

/**
 * Get current user information
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getCurrentUser = async (req, res) => {
  try {
    // Fetch full user data from database
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return error(res, 'User not found', 404);
    }

        return success(res, {
      id: user._id,
      username: user.username,
      displayName: user.displayName,
      avatar: user.avatar,
      role: user.role
    }, 'User information retrieved');
  } catch (err) {
    logger.error(`Failed to get current user: ${err.message}`, { stack: err.stack });
    return error(res, 'Failed to get user information');
  }
};
