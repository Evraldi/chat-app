const Message = require('../models/Message');
const logger = require('../utils/logger');
const { success, error } = require('../utils/responseHandler');

/**
 * Get messages for a specific room
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getMessages = async (req, res) => {
  try {
    const { room } = req.query;

    if (!room) {
      return error(res, 'Room query parameter is required', 400);
    }

    const messages = await Message.find({ room })
      .sort({ createdAt: -1 })
      .limit(50);

    if (!messages.length) {
      return error(res, 'No messages found', 404);
    }

    return success(res, { messages }, 'Messages retrieved successfully');
  } catch (err) {
    logger.error(`Failed to fetch messages: ${err.message}`, { stack: err.stack });
    return error(res, 'Failed to fetch messages');
  }
};

/**
 * Create a new message
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createMessage = async (req, res) => {
  try {
    const { username, text, room } = req.body;

    if (!username || !text || !room) {
      return error(res, 'Username, text, and room are required', 400);
    }

    // Fetch user data to get displayName and avatar
    const user = await User.findOne({ username }).select('displayName avatar');
    const displayName = user?.displayName || '';
    const avatar = user?.avatar || '';

    const message = new Message({ username, displayName, avatar, text, room });
    await message.save();
    
    logger.info(`Message created: ${message._id}`, { username, room });
    return success(res, { message }, 'Message created successfully', 201);
  } catch (err) {
    logger.error(`Failed to create message: ${err.message}`, { stack: err.stack });
    return error(res, 'Failed to create message');
  }
};

/**
 * Delete all messages in a room
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteMessages = async (req, res) => {
  try {
    const { room } = req.query;

    if (!room) {
      return error(res, 'Room query parameter is required', 400);
    }

    const result = await Message.deleteMany({ room });

    if (result.deletedCount === 0) {
      return error(res, 'No messages found to delete', 404);
    }

    logger.info(`Deleted ${result.deletedCount} messages from room: ${room}`);
    return success(res, { deletedCount: result.deletedCount }, 'Messages deleted successfully');
  } catch (err) {
    logger.error(`Failed to delete messages: ${err.message}`, { stack: err.stack });
    return error(res, 'Failed to delete messages');
  }
};
