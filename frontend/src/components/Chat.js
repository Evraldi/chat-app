import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Chat = ({ socket, room, setRoom, username, setUsername }) => {
  const [message, setMessage] = useState('');
  const [rooms, setRooms] = useState([]);
  const [messages, setMessages] = useState([]);

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

  const handleSendMessage = () => {
    if (message && room && username) {
      socket.emit('sendMessage', { text: message, room, username }, (response) => {
        if (response.status === 'ok') {
          setMessage('');
        } else {
          console.error('Failed to send message');
        }
      });
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on('receiveMessage', (newMessage) => {
        setMessages(prevMessages => [...prevMessages, newMessage]);
      });

      socket.on('previousMessages', (msgs) => {
        setMessages(msgs);
      });

      return () => {
        socket.off('receiveMessage');
        socket.off('previousMessages');
      };
    }
  }, [socket]);

  useEffect(() => {
    if (socket && room && username) {
      socket.emit('joinRoom', { room, username });
    }
  }, [socket, room, username]);

  const handleLogout = () => {
    setUsername('');
    setRoom('');
    socket.disconnect();
  };

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
        <button onClick={() => {
          const roomName = prompt('Enter new room name:');
          if (roomName) {
            axios.post('http://localhost:5000/rooms', { name: roomName })
              .then(() => setRooms(prevRooms => [...prevRooms, { name: roomName }]))
              .catch(error => console.error('Error creating room:', error));
          }
        }}>Create Room</button>
        <button onClick={handleLogout}>Logout</button>
      </div>
      <div className="message-list">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            <strong>{msg.username}: </strong>{msg.text}
          </div>
        ))}
      </div>
      <div className="message-input">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message"
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
