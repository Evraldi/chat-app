require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const messageRoutes = require('./routes/messages');
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const { handleError } = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const setupSocketIo = require('./socketHandlers');

// Check for required environment variables
if (!process.env.JWT_SECRET) {
  logger.error('JWT_SECRET environment variable is not set');
  process.exit(1);
}

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Connect to MongoDB
connectDB().catch(err => {
  logger.error(`Failed to connect to database: ${err.message}`);
});

// Configure rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { success: false, message: 'Too many requests, please try again later' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: { success: false, message: 'Too many login attempts, please try again later' }
});

// Apply global middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting
app.use('/api/', apiLimiter);
app.use('/auth/login', authLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// API routes
app.use('/messages', messageRoutes);
app.use('/auth', authRoutes);
app.use('/rooms', roomRoutes);

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use(handleError);

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }
});

// Set up Socket.IO event handlers
setupSocketIo(io);

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`, { stack: err.stack });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`, { stack: err.stack });
  // Exit in production, but keep running in development
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});
