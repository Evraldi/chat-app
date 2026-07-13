const express = require('express');
const validateInput = require('../middleware/validateInput');
const auth = require('../middleware/auth');
const messageController = require('../controllers/messageController');
const router = express.Router();

/**
 * @route   GET /messages
 * @desc    Get messages for a specific room
 * @access  Private (requires JWT)
 */
router.get('/', auth, messageController.getMessages);

/**
 * @route   POST /messages
 * @desc    Create a new message
 * @access  Private (requires JWT)
 */
router.post('/', auth, validateInput, messageController.createMessage);

/**
 * @route   DELETE /messages
 * @desc    Delete all messages in a room
 * @access  Private (should be restricted to admins in a real app)
 */
router.delete('/', auth, messageController.deleteMessages);

module.exports = router;
