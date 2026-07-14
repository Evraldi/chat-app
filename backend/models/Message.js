const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  username: { type: String, required: true },
  displayName: { type: String, default: '' },
  avatar: { type: String, default: '' },
  text: { type: String, default: '' },
  room: { type: String, required: true },
  media: { type: String, default: '' }, // base64 or URL
  mediaType: { type: String, default: '' }, // e.g., 'image/png' or 'audio/webm'
}, { timestamps: true });

// Compound index for efficient message queries by room, sorted by date
messageSchema.index({ room: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
