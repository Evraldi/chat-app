const Message = require('../models/Message');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Handle sending a new message
 * @param {Object} io - Socket.io instance
 * @param {Object} socket - Socket instance
 * @param {Object} message - Message object
 * @param {Function} callback - Callback function
 */
exports.handleSendMessage = async (io, socket, message, callback) => {
  const username = socket.user?.username;
  logger.info('Received sendMessage event', { 
    username,
    room: message?.room,
    text: message?.text
  });
  
  try {
    if (!message || !message.text || !message.room) {
      logger.warn('Invalid message format', { message });
      callback({ status: 'error', message: 'Message text and room are required' });
      return;
    }
    
    if (!username) {
      logger.warn('Unauthenticated sendMessage attempt');
      callback({ status: 'error', message: 'Authentication required' });
      return;
    }
    
    const user = await User.findOne({ username }).select('displayName avatar');
    const displayName = user?.displayName || '';
    const avatar = user?.avatar || '';
    
    const newMessage = new Message({
      username,
      displayName,
      avatar,
      text: message.text,
      room: message.room,
      media: message.media || '',
      mediaType: message.mediaType || ''
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
