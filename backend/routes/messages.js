const express = require('express');
const Message = require('../models/Message');
const validateInput = require('../middleware/validateInput');
const handleError = require('../middleware/errorHandler');
const router = express.Router();

// Fetch messages
router.get('/', async (req, res) => {
  try {
    const { room } = req.query;

    if (!room) {
      return res.status(400).json({ success: false, message: 'Room query parameter is required' });
    }

    const messages = await Message.find({ room })
      .sort({ createdAt: -1 })
      .limit(50);


    if (!messages.length) {
      return res.status(404).json({ success: false, message: 'No messages found' });
    }

    res.json({ success: true, messages });
  } catch (error) {
    handleError(res, error, 'Failed to fetch messages');
  }
});

// Create message
router.post('/', validateInput, async (req, res) => {
  const { username, text, room } = req.body;

  if (!username || !text || !room) {
    return res.status(400).json({ success: false, message: 'Username, text, and room are required' });
  }

  try {
    const message = new Message({ username, text, room });
    await message.save();
    res.status(201).json({ success: true, message });
  } catch (error) {
    handleError(res, error, 'Failed to create message');
  }
});

// delete all messages in a room
router.delete('/', async (req, res) => {
  try {
    const { room } = req.query;

    if (!room) {
      return res.status(400).json({ success: false, message: 'Room query parameter is required' });
    }

    const result = await Message.deleteMany({ room });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'No messages found to delete' });
    }

    res.status(200).json({ success: true, message: 'All messages deleted' });
  } catch (error) {
    handleError(res, error, 'Failed to delete messages');
  }
});

module.exports = router;
