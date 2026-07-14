const Message = require('../models/Message');
const User = require('../models/User');
const logger = require('../utils/logger');
const { success, error } = require('../utils/responseHandler');

/**
 * Get messages for a specific room
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getMessages = async (req, res) => {
  try {
    const { room, cursor, limit = 50 } = req.query;

    if (!room) {
      return error(res, 'Room query parameter is required', 400);
    }

    const queryLimit = Math.min(parseInt(limit, 10) || 50, 100);

    const query = { room };
    if (cursor) {
      // Cursor-based pagination: get messages older than the cursor ID
      query._id = { $lt: cursor };
    }

    const messages = await Message.find(query)
      .sort({ _id: -1 })
      .limit(queryLimit + 1); // Ambil 1 extra buat deteksi "hasMore"

    const hasMore = messages.length > queryLimit;
    if (hasMore) messages.pop(); // Buang extra

    const nextCursor = messages.length > 0 ? messages[messages.length - 1]._id : null;

    return success(res, { messages, nextCursor, hasMore }, 'Messages retrieved successfully');
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
    // Username diambil dari JWT token (req.user), bukan dari body
    const username = req.user?.username;
    const { text, room, media, mediaType } = req.body;

    if (!room) {
      return error(res, 'Room is required', 400);
    }
    if (!text && !media) {
      return error(res, 'Message text or media is required', 400);
    }
    // Fetch user data to get displayName and avatar
    const user = await User.findOne({ username }).select('displayName avatar');
    const displayName = user?.displayName || '';
    const avatar = user?.avatar || '';
    const message = new Message({ username, displayName, avatar, text, room, media: media || '', mediaType: mediaType || '' });
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
