import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const Chat = ({ socket, room, setRoom, username, setUsername }) => {
  const [message, setMessage] = useState('');
  const [rooms, setRooms] = useState([]);
  const [messages, setMessages] = useState([]);

  // Fetch rooms on component mount
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get('http://localhost:5000/rooms');
        setRooms(response.data);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    };

    fetchRooms();
  }, []);

  // Handle room creation
  const handleCreateRoom = async () => {
    const roomName = prompt('Enter new room name:');
    if (roomName) {
      try {
        await axios.post('http://localhost:5000/rooms', { name: roomName });
        setRooms((prevRooms) => [...prevRooms, { name: roomName }]);
      } catch (error) {
        console.error('Error creating room:', error);
      }
    }
  };

  // Handle sending messages
  const handleSendMessage = () => {
    if (message && room) {
      socket.emit('sendMessage', { text: message, room }, (response) => {
        if (response.status === 'ok') {
          setMessage('');
        } else {
          console.error('Failed to send message');
        }
      });
    }
  };

  // Handle socket events and fetch messages when room changes
  useEffect(() => {
    if (socket && room) {
      // Join room on mount
      socket.emit('joinRoom', room);

      // Fetch initial messages for the room
      const fetchMessages = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/messages?room=${room}`);
          setMessages(response.data);
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      };

      fetchMessages();

      // Listen for new messages
      const handleReceiveMessage = (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      };

      socket.on('receiveMessage', handleReceiveMessage);

      // Cleanup socket listener on room change
      return () => {
        socket.off('receiveMessage', handleReceiveMessage);
      };
    }
  }, [socket, room]);

  return (
    <div className="chat">
      <div className="room-selection">
        <select value={room} onChange={(e) => setRoom(e.target.value)}>
          <option value="">Select a room</option>
          {rooms.map((r, index) => (
            <option key={index} value={r.name}>
              {r.name}
            </option>
          ))}
        </select>
        <button onClick={handleCreateRoom}>Create Room</button>
      </div>
      <MessageList messages={messages} />
      <MessageInput message={message} setMessage={setMessage} handleSendMessage={handleSendMessage} />
    </div>
  );
};

export default Chat;
