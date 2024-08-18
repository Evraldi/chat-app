// MessageInput.js
import React from 'react';

const MessageInput = ({ message, setMessage, handleSendMessage }) => {
  return (
    <div className="message-input">
      <input 
        value={message} 
        onChange={(e) => setMessage(e.target.value)} 
        placeholder="Type a message" 
      />
      <button onClick={handleSendMessage}>Send</button>
    </div>
  );
};

export default MessageInput;
