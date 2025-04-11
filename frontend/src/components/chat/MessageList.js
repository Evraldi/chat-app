import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { formatDate } from '../../utils/helpers';
import './MessageList.css';

/**
 * Message list component
 */
const MessageList = ({ messages, currentUsername }) => {
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // If no messages, show empty state
  if (!messages.length) {
    return (
      <div className="message-list-empty">
        <p>No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <div className="message-list">
      {messages.map((message, index) => {
        const isOwnMessage = message.username === currentUsername;
        const isSystem = message.username === 'System';
        
        return (
          <div 
            key={message._id || index}
            className={`message ${isOwnMessage ? 'message-own' : ''} ${isSystem ? 'message-system' : ''}`}
          >
            {!isSystem && (
              <div className="message-header">
                <span className="message-username">{message.username}</span>
                {message.createdAt && (
                  <span className="message-time">
                    {formatDate(message.createdAt)}
                  </span>
                )}
              </div>
            )}
            <div className="message-content">{message.text}</div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

MessageList.propTypes = {
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      username: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
      createdAt: PropTypes.string
    })
  ).isRequired,
  currentUsername: PropTypes.string.isRequired
};

export default MessageList;
