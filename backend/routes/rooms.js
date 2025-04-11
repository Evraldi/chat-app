const express = require('express');
const roomController = require('../controllers/roomController');
const router = express.Router();

/**
 * @route   GET /rooms
 * @desc    Get all rooms
 * @access  Public
 */
router.get('/', roomController.getRooms);

/**
 * @route   POST /rooms
 * @desc    Create a new room
 * @access  Public
 */
router.post('/', roomController.createRoom);

module.exports = router;
