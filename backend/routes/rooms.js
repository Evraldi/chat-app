const express = require('express');
const Room = require('../models/Room');
const router = express.Router();

router.post('/', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: 'Room name is required' });

  try {
    const existingRoom = await Room.findOne({ name });
    if (existingRoom) return res.status(400).json({ message: 'Room already exists' });

    const room = new Room({ name });
    await room.save();
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
