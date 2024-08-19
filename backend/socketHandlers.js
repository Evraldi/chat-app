const Message = require('./models/Message');
const Room = require('./models/Room');

const setupSocketIo = (io) => {
  io.of('/chat').on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Handle joining a room
    socket.on('joinRoom', async ({ room, username }) => {
      console.log(`User ${username} joined room ${room}`);
      try {
        const roomDoc = await Room.findOne({ name: room });
        if (!roomDoc) {
          console.log(`Room ${room} does not exist`);
          socket.emit('receiveMessage', { text: `Room ${room} does not exist`, username: 'System' });
          return;
        }
        socket.join(room);
        console.log(`User ${username} joined room ${room}`);
        io.of('/chat').to(room).emit('receiveMessage', { text: `User ${username} joined room ${room}`, username: 'System' });

        const messages = await Message.find({ room }).sort({ createdAt: 1 });
        console.log(`Sending previous messages to ${room}:`, messages);
        socket.emit('previousMessages', messages);
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('receiveMessage', { text: 'Error joining room', username: 'System' });
      }
    });

    // Handle sending a new message
    socket.on('sendMessage', async (message, callback) => {
      console.log('Received sendMessage event:', message);
      try {
        const newMessage = new Message({
          username: message.username,
          text: message.text,
          room: message.room,
        });
        await newMessage.save();
        console.log('Message saved:', newMessage);
        io.of('/chat').to(message.room).emit('receiveMessage', newMessage);
        callback({ status: 'ok' });
      } catch (error) {
        console.error('Error saving message:', error);
        callback({ status: 'error' });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`User disconnected, reason: ${reason}`);
    });
  });
};

module.exports = setupSocketIo;
