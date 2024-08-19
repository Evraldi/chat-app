import React from 'react';

const MessageInput = ({ message, setMessage, onSendMessage }) => {
  return (
    <div className="message-input">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message"
      />
      <button onClick={onSendMessage}>Send</button>
    </div>
  );
};

export default MessageInput;
