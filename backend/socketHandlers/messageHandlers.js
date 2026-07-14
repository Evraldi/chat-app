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
    if (!message || !message.room) {
      logger.warn('Invalid message format', { message });
      callback({ status: 'error', message: 'Room is required' });
      return;
    }

    // Text is optional when media (image/voice note) is attached
    if (!message.text && !message.media) {
      logger.warn('Empty message', { message });
      callback({ status: 'error', message: 'Message must contain text or media' });
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
      text: message.text || '',
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

/**
 * Handle deleting a message (owner or admin only)
 * @param {Object} io - Socket.io instance
 * @param {Object} socket - Socket instance
 * @param {Object} data - { messageId, room }
 * @param {Function} callback - Callback function
 */
exports.handleDeleteMessage = async (io, socket, data, callback) => {
  const username = socket.user?.username;
  const userRole = socket.user?.role;
  const { messageId, room } = data || {};

  if (!messageId || !room) {
    callback({ status: 'error', message: 'messageId and room are required' });
    return;
  }

  if (!username) {
    callback({ status: 'error', message: 'Authentication required' });
    return;
  }

  try {
    const message = await Message.findById(messageId);
    if (!message) {
      callback({ status: 'error', message: 'Message not found' });
      return;
    }

    const isOwner = message.username === username;
    const isAdmin = userRole === 'admin';

    if (!isOwner && !isAdmin) {
      callback({ status: 'error', message: 'Not authorized to delete this message' });
      return;
    }

    await Message.findByIdAndDelete(messageId);
    logger.info('Message deleted', { id: messageId, by: username, role: userRole });

    io.of('/chat').to(room).emit('messageDeleted', { messageId });
    callback({ status: 'ok' });
  } catch (error) {
    logger.error(`Error deleting message: ${error.message}`, { stack: error.stack });
    callback({ status: 'error', message: 'Failed to delete message' });
  }
};
