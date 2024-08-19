require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const messageRoutes = require('./routes/messages');
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const handleError = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const setupSocketIo = require('./socketHandlers');

const app = express();
const server = http.createServer(app);

connectDB();

// Middleware.
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST'],
  credentials: true,
}));
app.use(express.json());

// API routes.
app.use('/messages', messageRoutes);
app.use('/auth', authRoutes);
app.use('/rooms', roomRoutes);

// Initialize Socket.IO and set up event handlers.
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
  }
});
setupSocketIo(io);

app.use(handleError);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
