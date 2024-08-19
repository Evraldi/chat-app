import React from 'react';

const MessageList = ({ messages }) => {
  return (
    <div className="message-list">
      {messages.map((msg, index) => (
        <div key={index} className="message">
          <strong>{msg.username}: </strong>{msg.text}
        </div>
      ))}
    </div>
  );
};

export default MessageList;
