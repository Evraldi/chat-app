const express = require('express');
const Message = require('../models/Message');
const validateInput = require('../middleware/validateInput');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 }).limit(50);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

router.post('/', validateInput, async (req, res) => {
  const { username, text } = req.body;
  try {
    const message = new Message({ username, text });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

router.delete('/', async (req, res) => {
  try {
    await Message.deleteMany({});
    res.status(200).json({ success: true, message: 'All messages deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;
