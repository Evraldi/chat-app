const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const messageRoutes = require('./routes/messages');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*', // Mengizinkan semua origin. Untuk keamanan, ganti ini dengan domain frontend kamu di produksi.
    methods: ['GET', 'POST'],
  }
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use('/messages', messageRoutes);

// Socket.IO setup
io.on('connection', (socket) => {
  console.log('New client connected');

  // Handle incoming messages from clients
  socket.on('sendMessage', (message) => {
    console.log('Received message:', message);

    // Save message to database (optional)
    // Add your database logic here

    // Broadcast message to all connected clients
    io.emit('receiveMessage', message);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
