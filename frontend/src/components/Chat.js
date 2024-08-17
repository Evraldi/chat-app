// In Chat.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Chat = ({ socket, room, setRoom, username, setUsername }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [rooms, setRooms] = useState([]);

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

  const handleCreateRoom = async (roomName) => {
    try {
      await axios.post('http://localhost:5000/rooms', { name: roomName });
      setRooms((prevRooms) => [...prevRooms, { name: roomName }]);
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  const handleSendMessage = () => {
    if (message) {
      socket.emit('sendMessage', { text: message, room }, (response) => {
        if (response.status === 'ok') {
          setMessage('');
        } else {
          console.error('Failed to send message');
        }
      });
    }
  };

  useEffect(() => {
    socket.on('receiveMessage', (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [socket]);

  return (
    <div className="chat">
      <div className="room-selection">
        <select value={room} onChange={(e) => setRoom(e.target.value)}>
          <option value="">Select a room</option>
          {rooms.map((room, index) => (
            <option key={index} value={room.name}>
              {room.name}
            </option>
          ))}
        </select>
        <button onClick={() => handleCreateRoom(prompt('Enter new room name:'))}>
          Create Room
        </button>
      </div>
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.username}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <input
        type="text"
        placeholder="Type a message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={handleSendMessage}>Send</button>
    </div>
  );
};

export default Chat;
