import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import "../css/chat.css";

const socket = io(process.env.REACT_APP_SOCKET_URL);

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }

    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/messages`);
        // Urutkan pesan berdasarkan createdAt secara menurun
        const sortedMessages = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setMessages(sortedMessages);
      } catch (err) {
        setError('Failed to load messages.');
      }
    };

    fetchMessages();

    socket.on('receiveMessage', (message) => {
      setMessages((prevMessages) => [message, ...prevMessages]);
    });

    return () => socket.off('receiveMessage');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (messageText && username) {
      try {
        await axios.post(`${process.env.REACT_APP_API_URL}/messages`, {
          username,
          text: messageText,
        });
        socket.emit('sendMessage', { username, text: messageText });
        setMessageText('');
      } catch (err) {
        setError('Failed to send message.');
      }
    }
  };

  return (
    <div className="Chat">
      <h1>Chat Application</h1>
      {error && <p className="error">{error}</p>}
      <div className="messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.username === username ? 'self' : 'other'}`}
          >
            <strong>{msg.username}: </strong>{msg.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Type a message"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          required
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat;
