import React, { useEffect, useState } from 'react';

const MessageList = ({ socket, room }) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on('receiveMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [socket]);

  return (
    <div className="message-list">
      <h2>Messages</h2>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}><strong>{msg.username}:</strong> {msg.text}</li>
        ))}
      </ul>
    </div>
  );
};

export default MessageList;
