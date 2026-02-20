const logger = require('./utils/logger');
const messageHandlers = require('./socketHandlers/messageHandlers');
const roomHandlers = require('./socketHandlers/roomHandlers');

/**
 * Set up Socket.IO event handlers
 * @param {Object} io - Socket.IO server instance
 */
const setupSocketIo = (io) => {
  const chatNamespace = io.of('/chat');

  chatNamespace.on('connection', (socket) => {
    logger.info('User connected', { socketId: socket.id });

    socket.on('joinRoom', (data) => {
      roomHandlers.handleJoinRoom(io, socket, data);
    });

    socket.on('leaveRoom', (data) => {
      roomHandlers.handleLeaveRoom(io, socket, data);
    });

    socket.on('sendMessage', (message, callback) => {
      messageHandlers.handleSendMessage(io, socket, message, callback);
    });

    socket.on('disconnect', (reason) => {
      logger.info('User disconnected', { socketId: socket.id, reason });
    });

    socket.on('error', (error) => {
      logger.error(`Socket error: ${error.message}`, {
        socketId: socket.id,
        stack: error.stack
      });
    });
  });

  chatNamespace.on('error', (error) => {
    logger.error(`Namespace error: ${error.message}`, { stack: error.stack });
  });

  return chatNamespace;
};

module.exports = setupSocketIo;
