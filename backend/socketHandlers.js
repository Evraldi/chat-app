const jwt = require('jsonwebtoken');
const logger = require('./utils/logger');
const messageHandlers = require('./socketHandlers/messageHandlers');
const roomHandlers = require('./socketHandlers/roomHandlers');

/**
 * Set up Socket.IO event handlers
 * @param {Object} io - Socket.IO server instance
 */
const setupSocketIo = (io) => {
  const chatNamespace = io.of('/chat');

  // Middleware: verify JWT token on every socket connection
  chatNamespace.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      logger.warn('Socket connection rejected: no token provided', { socketId: socket.id });
      return next(new Error('Authentication required'));
    }

    try {
      const JWT_SECRET = process.env.JWT_SECRET;
      if (!JWT_SECRET) {
        logger.error('JWT_SECRET environment variable is not set');
        return next(new Error('Server configuration error'));
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      socket.user = decoded; // Attach user data to socket
      logger.info('Socket authenticated', { socketId: socket.id, username: decoded.username });
      next();
    } catch (err) {
      logger.warn('Socket connection rejected: invalid token', { socketId: socket.id, error: err.message });
      next(new Error('Invalid or expired token'));
    }
  });

  chatNamespace.on('connection', (socket) => {
    logger.info('User connected', { socketId: socket.id, username: socket.user?.username });

    socket.on('joinRoom', (data) => {
      roomHandlers.handleJoinRoom(io, socket, data);
    });

    socket.on('leaveRoom', (data) => {
      roomHandlers.handleLeaveRoom(io, socket, data);
    });

    socket.on('sendMessage', (message, callback) => {
      messageHandlers.handleSendMessage(io, socket, message, callback);
    });

    socket.on('deleteMessage', (data, callback) => {
      messageHandlers.handleDeleteMessage(io, socket, data, callback);
    });

    socket.on('disconnect', (reason) => {
      logger.info('User disconnected', { socketId: socket.id, username: socket.user?.username, reason });
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
