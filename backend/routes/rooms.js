const express = require('express');
const roomController = require('../controllers/roomController');
const auth = require('../middleware/auth');
const router = express.Router();

/**
 * @route   GET /rooms
 * @desc    Get all rooms
 * @access  Private (requires JWT)
 */
router.get('/', auth, roomController.getRooms);

/**
 * @route   POST /rooms
 * @desc    Create a new room
 * @access  Private (requires JWT)
 */
router.post('/', auth, roomController.createRoom);

module.exports = router;
