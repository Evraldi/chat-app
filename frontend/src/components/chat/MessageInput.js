import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '../common/Button';
import './MessageInput.css';

/**
 * Message input component
 */
const MessageInput = ({ onSendMessage, disabled }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (disabled) return;
    if (!message.trim() && !selectedFile) {
      return;
    }
    let media = '';
    let mediaType = '';
    if (selectedFile) {
      media = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });
      mediaType = selectedFile.type;
    }
    const payload = {
      text: message.trim(),
      media,
      mediaType
    };
    try {
      await onSendMessage(payload);
      setMessage('');
      setSelectedFile(null);
    } catch (error) {
      // silent fail - error handled by parent
    }
    return;
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
            <input
              type="file"
              accept="image/*,audio/*"
              className="media-input"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              disabled={disabled}
            />
      <Button
              type="submit"
              variant="primary"
              disabled={(!message.trim() && !selectedFile) || disabled}
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
