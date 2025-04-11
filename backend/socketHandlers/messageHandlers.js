const Message = require('../models/Message');
const logger = require('../utils/logger');

/**
 * Handle sending a new message
 * @param {Object} io - Socket.io instance
 * @param {Object} socket - Socket instance
 * @param {Object} message - Message object
 * @param {Function} callback - Callback function
 */
exports.handleSendMessage = async (io, socket, message, callback) => {
  logger.info('Received sendMessage event', { 
    username: message?.username,
    room: message?.room
  });
  
  try {
    if (!message || !message.username || !message.text || !message.room) {
      logger.warn('Invalid message format', { message });
      callback({ status: 'error', message: 'Invalid message format' });
      return;
    }
    
    const newMessage = new Message({
      username: message.username,
      text: message.text,
      room: message.room,
    });
    
    await newMessage.save();
    logger.info('Message saved', { id: newMessage._id, room: message.room });
    
    io.of('/chat').to(message.room).emit('receiveMessage', newMessage);
    callback({ status: 'ok' });
  } catch (error) {
    logger.error(`Error saving message: ${error.message}`, { stack: error.stack });
    callback({ status: 'error', message: 'Failed to save message' });
  }
};
