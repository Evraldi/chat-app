const express = require('express');
const Message = require('../models/Message');
const validateInput = require('../middleware/validateInput');
const router = express.Router();

// Utility function to handle errors
const handleError = (res, error, message = 'Server Error') => {
  console.error(error); // Log the error details for debugging
  res.status(500).json({ success: false, message });
};

router.get('/', async (req, res) => {
  try {
    // Validate query parameters
    const { room } = req.query;
    if (!room) {
      return res.status(400).json({ success: false, message: 'Room query parameter is required' });
    }

    // Fetch messages from the database
    const messages = await Message.find({ room })
      .sort({ createdAt: -1 })
      .limit(50);

    if (!messages) {
      return res.status(404).json({ success: false, message: 'No messages found' });
    }

    res.json(messages);
  } catch (error) {
    handleError(res, error, 'Failed to fetch messages');
  }
});

router.post('/', validateInput, async (req, res) => {
  const { username, text, room } = req.body;

  // Validate request body
  if (!username || !text || !room) {
    return res.status(400).json({ success: false, message: 'Username, text, and room are required' });
  }

  try {
    // Create and save the new message
    const message = new Message({ username, text, room });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    handleError(res, error, 'Failed to create message');
  }
});

router.delete('/', async (req, res) => {
  try {
    // Validate query parameters
    const { room } = req.query;
    if (!room) {
      return res.status(400).json({ success: false, message: 'Room query parameter is required' });
    }

    // Delete messages from the database
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
