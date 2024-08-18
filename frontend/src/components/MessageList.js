// MessageList.js
import React from 'react';

const MessageList = ({ messages }) => {
  if (!messages.length) {
    return <div>No messages yet...</div>;
  }

  return (
    <div className="message-list">
      <h2>Messages</h2>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>
            <strong>{msg.username}:</strong> {msg.text}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MessageList;
