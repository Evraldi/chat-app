import React, { useEffect, useRef, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import './MessageList.css';

/**
 * Message list component
 */
const MessageList = React.memo(({ messages, currentUsername, currentUserRole, onDeleteMessage }) => {
  const messagesEndRef = useRef(null);
  const prevMessagesLengthRef = useRef(0);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const canDelete = (message) =>
    !message.username !== 'System' &&
    (message.username === currentUsername || currentUserRole === 'admin');

  const toggleMenu = (id) => {
    setMenuOpenId((prev) => (prev === id ? null : id));
  };

  const handleDeleteClick = (messageId) => {
    setMenuOpenId(null);
    setPendingDeleteId(messageId);
  };

  const confirmDelete = () => {
    if (pendingDeleteId && onDeleteMessage) {
      onDeleteMessage(pendingDeleteId);
    }
    setPendingDeleteId(null);
  };

  const cancelDelete = () => {
    setPendingDeleteId(null);
  };

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
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (messages.length > 0 && prevMessagesLengthRef.current === 0) {
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
      const deletable = !isSystemMessage && (message.username === currentUsername || currentUserRole === 'admin');

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
            className={`message ${isOwnMessage ? 'message-own' : ''} ${isSystemMessage ? 'message-system' : ''}`}
          >
            {!isSystemMessage && !isOwnMessage && (
              <div className="message-header">
                <span className="message-username">{message.displayName || message.username}</span>
              </div>
            )}

            <div className="message-content">
              {message.text}
              {message.media && message.mediaType && (
                <div className="message-media">
                  {message.mediaType.startsWith('image/') ? (
                    <img src={message.media} alt="media" className="message-image" />
                  ) : message.mediaType.startsWith('audio/') ? (
                    <audio controls src={message.media} className="message-audio" />
                  ) : null}
                </div>
              )}
            </div>

            {!isSystemMessage && (
              <div className="message-time">
                {formatTime(message.createdAt)}
              </div>
            )}
          </div>

          {deletable && (
            <div className="msg-actions">
              <button
                type="button"
                className="msg-kebab"
                title="More actions"
                onClick={() => toggleMenu(message._id)}
                aria-label="More actions"
              >
                &#8942;
              </button>
              {menuOpenId === message._id && (
                <>
                  <div className="msg-menu-backdrop" onClick={() => setMenuOpenId(null)} />
                  <div className="msg-menu" role="menu">
                    <button
                      type="button"
                      className="msg-menu-item msg-menu-delete"
                      onClick={() => handleDeleteClick(message._id)}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      );
    });

    return content;
  }, [messages, currentUsername, currentUserRole, menuOpenId]);

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

      {pendingDeleteId && (
        <div className="confirm-backdrop" onClick={cancelDelete}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="confirm-icon" aria-hidden="true">!</div>
            <h3 className="confirm-title">Delete message?</h3>
            <p className="confirm-text">This action cannot be undone.</p>
            <div className="confirm-actions">
              <button type="button" className="confirm-btn confirm-cancel" onClick={cancelDelete}>
                Cancel
              </button>
              <button type="button" className="confirm-btn confirm-delete" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

MessageList.propTypes = {
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      username: PropTypes.string.isRequired,
      text: PropTypes.string,
      media: PropTypes.string,
      mediaType: PropTypes.string,
      createdAt: PropTypes.string
    })
  ).isRequired,
  currentUsername: PropTypes.string.isRequired,
  currentUserRole: PropTypes.string,
  onDeleteMessage: PropTypes.func
};

export default MessageList;
