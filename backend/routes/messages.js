// backend/routes/messages.js

const express = require('express');
const Message = require('../models/Message');
const router = express.Router();

// GET messages
router.get('/', async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 }).limit(50);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// POST message
router.post('/', async (req, res) => {
  const { username, text } = req.body;
  try {
    const message = new Message({ username, text });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
