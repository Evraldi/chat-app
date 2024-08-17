import React, { useState } from 'react';

const MessageInput = ({ socket, room, username }) => {
  const [message, setMessage] = useState('');

  const handleSendMessage = () => {
    if (message && room) {
      socket.emit('sendMessage', { text: message, room }, (response) => {
        if (response.status === 'ok') {
          setMessage('');
        } else {
          console.error('Error sending message');
        }
      });
    }
  };

  return (
    <div className="message-input">
      <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message" />
      <button onClick={handleSendMessage}>Send</button>
    </div>
  );
};

export default MessageInput;
