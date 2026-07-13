require('dotenv').config();
const express = require('express');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const messageRoutes = require('./routes/messages');
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const profileRoutes = require('./routes/profile');
const { handleError } = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const setupSocketIo = require('./socketHandlers');

if (!process.env.JWT_SECRET) {
  logger.error('JWT_SECRET environment variable is not set');
  process.exit(1);
}

const app = express();
const server = http.createServer(app);

connectDB().catch(err => {
  logger.error(`Failed to connect to database: ${err.message}`);
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts, please try again later' }
});

// Parse CORS origins: support comma-separated values and wildcard
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()).filter(Boolean)
  : ['http://localhost:3000'];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, curl, etc)
    if (!origin || corsOrigins.includes('*')) return callback(null, true);
    if (corsOrigins.includes(origin)) return callback(null, true);
    callback(null, true); // allow all for now in development
  },
  methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
  credentials: true,
};

app.use(cors(corsOptions));
app.set('trust proxy', 1);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiters to actual route paths
app.use('/auth/login', authLimiter);

// General API rate limiter - apply to all API routes
app.use('/messages', apiLimiter);
app.use('/rooms', apiLimiter);
app.use('/profile', apiLimiter);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

app.use('/messages', messageRoutes);
app.use('/auth', authRoutes);
app.use('/rooms', roomRoutes);
app.use('/profile', profileRoutes);

// Serve static frontend build in production
const buildPath = path.join(__dirname, '..', 'frontend', 'build');
app.use(express.static(buildPath));

// SPA fallback - serve index.html for any non-API routes
const apiRoutes = ['/messages', '/auth', '/rooms', '/profile', '/health'];
app.get('*', (req, res) => {
  const isApiPath = apiRoutes.some(route => req.path.startsWith(route));
  if (!isApiPath && req.accepts('html')) {
    res.sendFile(path.join(buildPath, 'index.html'));
  } else {
    res.status(404).json({ success: false, message: 'Route not found' });
  }
});

app.use(handleError);

const io = socketIo(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || corsOrigins.includes('*')) return callback(null, true);
      if (corsOrigins.includes(origin)) return callback(null, true);
      callback(null, true);
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }
});

setupSocketIo(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`, { stack: err.stack });
});

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`, { stack: err.stack });
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});
