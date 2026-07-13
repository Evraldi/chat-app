import React, { useEffect, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import './MessageList.css';

/**
 * Message list component
 */
const MessageList = React.memo(({ messages, currentUsername }) => {
  const messagesEndRef = useRef(null);
  const prevMessagesLengthRef = useRef(0);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  useEffect(() => {
    if (messages.length > prevMessagesLengthRef.current) {
      // New messages added, scroll smoothly
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (messages.length > 0 && prevMessagesLengthRef.current === 0) {
      // Initial load, scroll to bottom instantly
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages]);

  const renderMessages = useMemo(() => {
    let lastDate = null;
    const content = [];

    messages.forEach((message, index) => {
      const messageDate = new Date(message.createdAt).toDateString();

      if (messageDate !== lastDate) {
        content.push(
          <div key={`date-${messageDate}`} className="date-separator">
            <span>{formatDate(message.createdAt)}</span>
          </div>
        );
        lastDate = messageDate;
      }


      const isOwnMessage = message.username === currentUsername;
      const isSystemMessage = message.username === 'System';

      content.push(
        <div
          key={message._id}
          className={`message-wrapper ${isOwnMessage ? 'own' : ''}`}
        >
          {!isSystemMessage && !isOwnMessage && (
            <div className={`message-avatar ${message.avatar ? 'has-avatar' : ''}`} title={message.displayName || message.username}>
              {message.avatar ? (
                <img src={message.avatar} alt="Avatar" />
              ) : (
                (message.displayName || message.username).charAt(0).toUpperCase()
              )}
            </div>
          )}
          <div
            className={`message ${isOwnMessage ? 'message-own' : ''} ${isSystemMessage ? 'message-system' : ''
              }`}
          >
            {!isSystemMessage && !isOwnMessage && (
              <div className="message-header">
                <span className="message-username">{message.displayName || message.username}</span>
              </div>
            )}

            <div className="message-content">{message.text}</div>

            {!isSystemMessage && (
              <div className="message-time">
                {formatTime(message.createdAt)}
              </div>
            )}
          </div>
        </div>
      );
    });

    return content;
  }, [messages, currentUsername]);

  if (!messages.length) {
    return (
      <div className="message-list message-list-empty">
        <p>No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <div className="message-list">
      {renderMessages}
      <div ref={messagesEndRef} />
    </div>
  );
});

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
