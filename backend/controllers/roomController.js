const Room = require('../models/Room');
const logger = require('../utils/logger');
const { success, error } = require('../utils/responseHandler');

/**
 * Get all rooms
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    return success(res, { rooms }, 'Rooms retrieved successfully');
  } catch (err) {
    logger.error(`Failed to fetch rooms: ${err.message}`, { stack: err.stack });
    return error(res, 'Failed to fetch rooms');
  }
};

/**
 * Create a new room
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createRoom = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return error(res, 'Room name is required', 400);
    }

    const existingRoom = await Room.findOne({ name });
    if (existingRoom) {
      return error(res, 'Room already exists', 400);
    }

    const room = new Room({ name });
    await room.save();
    
    logger.info(`Room created: ${room._id}`, { name });
    return success(res, { room }, 'Room created successfully', 201);
  } catch (err) {
    logger.error(`Failed to create room: ${err.message}`, { stack: err.stack });
    return error(res, 'Failed to create room');
  }
};
