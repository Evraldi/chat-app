/**
 * Database seed script
 * Run with: npm run seed
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Room = require('../models/Room');
const Message = require('../models/Message');
const logger = require('../utils/logger');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('MONGO_URI environment variable is not set');
  process.exit(1);
}

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    logger.info('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Room.deleteMany({});
    await Message.deleteMany({});
    logger.info('Cleared existing data');

    // Create users
    const user1 = new User({
      username: 'alice',
      password: 'password123',
      displayName: 'Alice'
    });
    await user1.save();
    logger.info(`Created user: ${user1.username}`);

    const user2 = new User({
      username: 'bob',
      password: 'password123',
      displayName: 'Bob'
    });
    await user2.save();
    logger.info(`Created user: ${user2.username}`);

    // Create rooms
    const room1 = new Room({ name: 'general' });
    await room1.save();
    logger.info(`Created room: ${room1.name}`);

    const room2 = new Room({ name: 'random' });
    await room2.save();
    logger.info(`Created room: ${room2.name}`);

    // Create sample messages
    const messages = [
      { username: 'alice', displayName: 'Alice', text: 'Welcome to the chat!', room: 'general' },
      { username: 'bob', displayName: 'Bob', text: 'Hey everyone!', room: 'general' },
      { username: 'alice', displayName: 'Alice', text: 'This is a test message.', room: 'random' },
    ];

    await Message.insertMany(messages);
    logger.info(`Created ${messages.length} sample messages`);

    logger.info('Seed completed successfully');
    process.exit(0);
  } catch (err) {
    logger.error(`Seed failed: ${err.message}`, { stack: err.stack });
    process.exit(1);
  }
};

seedData();
