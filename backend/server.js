require('dotenv').config();

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const Message = require('./models/Message');
const Room = require('./models/Room');  // Import Room model
const messageRoutes = require('./routes/messages');
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');  // Import room routes
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const redisAdapter = require('socket.io-redis');
const jwt = require('jsonwebtoken');

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

io.adapter(redisAdapter({ host: 'localhost', port: 6379 }));

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST'],
  credentials: true,
}));

app.use(express.json());

app.use('/messages', messageRoutes);
app.use('/auth', authRoutes);
app.use('/rooms', roomRoutes);

io.of('/chat').use((socket, next) => {
  const token = socket.handshake.auth.token;
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return next(new Error('Authentication error'));
    socket.user = user;
    next();
  });
});

io.of('/chat').on('connection', (socket) => {
  logger.info(`User connected: ${socket.user.id}`);

  socket.on('joinRoom', async (roomName) => {
    try {
      const room = await Room.findOne({ name: roomName });
      if (!room) {
        socket.emit('receiveMessage', { text: `Room ${roomName} does not exist`, username: 'System' });
        return;
      }
      socket.join(roomName);
      io.of('/chat').to(roomName).emit('receiveMessage', { text: `User ${socket.user.username} joined room ${roomName}`, username: 'System' });
    } catch (error) {
      socket.emit('receiveMessage', { text: 'Error joining room', username: 'System' });
    }
  });

  socket.on('sendMessage', async (message, callback) => {
    try {
      const newMessage = new Message({
        username: socket.user.username,
        text: message.text,
        room: message.room,
      });
      await newMessage.save();

      io.of('/chat').to(message.room).emit('receiveMessage', newMessage);
      callback({ status: 'ok' });
    } catch (error) {
      logger.error('Error saving message:', error);
      callback({ status: 'error' });
    }
  });

  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.user.id}`);
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
