import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '../common/Button';
import './MessageInput.css';

/**
 * Message input component
 */
const MessageInput = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (message.trim() && !disabled) {
      try {
        await onSendMessage(message);
        setMessage('');
            } catch (error) {
        // silent fail - error handled by parent
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  return (
    <form className="message-input-container" onSubmit={handleSubmit}>
      <input
        type="text"
        className="message-input"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type a message..."
        disabled={disabled}
      />
      <Button
        type="submit"
        variant="primary"
        disabled={!message.trim() || disabled}
      >
        Send
      </Button>
    </form>
  );
};

MessageInput.propTypes = {
  onSendMessage: PropTypes.func.isRequired,
  disabled: PropTypes.bool
};

export default MessageInput;
