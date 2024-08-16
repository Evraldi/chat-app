require('dotenv').config();

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const Message = require('./models/Message');
const messageRoutes = require('./routes/messages');
const authRoutes = require('./routes/auth');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();
const server = http.createServer(app);

connectDB();

const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
  }
});

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST'],
  credentials: true,
}));

app.use(express.json());

app.use('/messages', messageRoutes);
app.use('/auth', authRoutes);

io.on('connection', (socket) => {
  logger.info('New client connected');

  socket.on('sendMessage', async (message) => {
    logger.info('Received message:', message);

    try {
      const newMessage = new Message(message);
      await newMessage.save();

      io.emit('receiveMessage', newMessage);
    } catch (err) {
      logger.error('Error saving message to DB:', err);
    }
  });

  socket.on('disconnect', () => {
    logger.info('Client disconnected');
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
