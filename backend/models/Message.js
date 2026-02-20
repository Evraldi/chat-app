const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  username: { type: String, required: true },
  displayName: { type: String, default: '' },
  avatar: { type: String, default: '' },
  text: { type: String, required: true },
  room: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
