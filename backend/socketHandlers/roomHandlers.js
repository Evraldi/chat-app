const Room = require('../models/Room');
const Message = require('../models/Message');
const logger = require('../utils/logger');

/**
 * Handle joining a room
 * @param {Object} io - Socket.io instance
 * @param {Object} socket - Socket instance
 * @param {Object} data - Room data
 */
exports.handleJoinRoom = async (io, socket, { room }) => {
  const username = socket.user?.username;
  logger.info(`User ${username} attempting to join room ${room}`);

  try {
    if (!room || !username) {
      logger.warn('Invalid join room data', { room, username });
      socket.emit('receiveMessage', {
        text: 'Invalid room or authentication required',
        username: 'System'
      });
      return;
    }

    const roomDoc = await Room.findOne({ name: room });
    if (!roomDoc) {
      logger.warn(`Room ${room} does not exist`);
      socket.emit('receiveMessage', {
        text: `Room ${room} does not exist`,
        username: 'System'
      });
      return;
    }

    // Join the socket to the room
    socket.join(room);
    logger.info(`User ${username} joined room ${room}`);

    // Send previous messages to the user
    try {
      const messages = await Message.find({ room }).sort({ createdAt: 1 });
      logger.info(`Sending ${messages.length} previous messages to user in room ${room}`);
      socket.emit('previousMessages', messages);
    } catch (error) {
      logger.error(`Error fetching previous messages: ${error.message}`, {
        stack: error.stack,
        room
      });
      socket.emit('receiveMessage', {
        text: 'Error loading previous messages',
        username: 'System'
      });
    }
  } catch (error) {
    logger.error(`Error joining room: ${error.message}`, {
      stack: error.stack,
      room,
      username
    });
    socket.emit('receiveMessage', {
      text: 'Error joining room',
      username: 'System'
    });
  }
};

/**
 * Handle leaving a room
 * @param {Object} io - Socket.io instance
 * @param {Object} socket - Socket instance
 * @param {Object} data - Room data
 */
exports.handleLeaveRoom = (io, socket, { room }) => {
  const username = socket.user?.username;
  logger.info(`User ${username} leaving room ${room}`);

  if (room) {
    socket.leave(room);
  }
};
