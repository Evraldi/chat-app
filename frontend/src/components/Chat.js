import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

function Chat() {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Fetch existing messages
    fetch('http://localhost:5000/messages')
      .then(response => response.json())
      .then(data => setMessages(data));

    // Listen for new messages
    socket.on('receiveMessage', (message) => {
      setMessages((prevMessages) => [message, ...prevMessages]);
    });

    return () => socket.off('receiveMessage');
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (username && messageText) {
      // Send the message to server through HTTP
      fetch('http://localhost:5000/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, text: messageText }),
      }).then(() => {
        // Send the message to all clients through WebSocket
        socket.emit('sendMessage', { username, text: messageText });
        setMessageText('');
      });
    }
  };

  return (
    <div className="Chat">
      <h1>Chat Application</h1>
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.username}: </strong>{msg.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Type a message"
          value={messageText}
          onChange={e => setMessageText(e.target.value)}
          required
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default Chat;
