const express = require('express');
const Room = require('../models/Room');
const handleError = require('../middleware/errorHandler');
const router = express.Router();

// Create a new room
router.post('/', async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: 'Room name is required' });
  }

  try {
    const existingRoom = await Room.findOne({ name });
    if (existingRoom) {
      return res.status(400).json({ success: false, message: 'Room already exists' });
    }

    const room = new Room({ name });
    await room.save();
    res.status(201).json({ success: true, room });
  } catch (error) {
    handleError(res, error, 'Failed to create room');
  }
});

// Fetch all rooms
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json({ success: true, rooms });
  } catch (error) {
    handleError(res, error, 'Failed to fetch rooms');
  }
});

module.exports = router;
