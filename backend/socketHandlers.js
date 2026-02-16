const logger = require('./utils/logger');
const messageHandlers = require('./socketHandlers/messageHandlers');
const roomHandlers = require('./socketHandlers/roomHandlers');

/**
 * Set up Socket.IO event handlers
 * @param {Object} io - Socket.IO server instance
 */
const setupSocketIo = (io) => {
  // Create a namespace for chat
  const chatNamespace = io.of('/chat');

  // Handle new connections
  chatNamespace.on('connection', (socket) => {
    logger.info('User connected', { socketId: socket.id });

    // Handle joining a room
    socket.on('joinRoom', (data) => {
      roomHandlers.handleJoinRoom(io, socket, data);
    });

    // Handle leaving a room
    socket.on('leaveRoom', (data) => {
      roomHandlers.handleLeaveRoom(io, socket, data);
    });

    // Handle sending a new message
    socket.on('sendMessage', (message, callback) => {
      messageHandlers.handleSendMessage(io, socket, message, callback);
    });

    // Handle disconnections
    socket.on('disconnect', (reason) => {
      logger.info('User disconnected', { socketId: socket.id, reason });
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error(`Socket error: ${error.message}`, {
        socketId: socket.id,
        stack: error.stack
      });
    });
  });

  // Handle namespace errors
  chatNamespace.on('error', (error) => {
    logger.error(`Namespace error: ${error.message}`, { stack: error.stack });
  });

  return chatNamespace;
};

module.exports = setupSocketIo;
