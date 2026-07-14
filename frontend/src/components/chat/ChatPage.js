import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';
import { useToast } from '../common/Toast';
import RoomSelector from './RoomSelector';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import Loader from '../common/Loader';
import ProfileModal from '../profile/ProfileModal';
import './ChatPage.css';

/**
 * Chat page component
 */
const ChatPage = () => {
  const { currentUser, logout } = useAuth();
  const {
    rooms,
    currentRoom,
    messages,
    loading,
    isLoadingMessages,
    error,
    setRoom,
    createRoom,
    sendMessage
  } = useChat();

  const { addToast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleRoomChange = (roomName) => {
    setRoom(roomName);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

    const handleCreateRoom = async (roomName) => {
    try {
      await createRoom(roomName);
      setRoom(roomName);
    } catch (err) {
      addToast(`Failed to create room: ${err.message}`, 'error');
    }
  };

  const handleSendMessage = async (payload) => {
    try {
      await sendMessage(payload);
      return true;
    } catch (err) {
      addToast(`Failed to send message: ${err.message}`, 'error');
      return false;
    }
  };

  const handleLogout = () => {
    logout();
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const openProfileModal = () => {
    setIsProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
  };

        return (
    <div className={`chat-page ${!isSidebarOpen ? 'sidebar-collapsed' : ''}`}>
      <div className={`sidebar-container ${isSidebarOpen ? 'open' : 'closed'}`}>
        <RoomSelector
          rooms={rooms}
          currentRoom={currentRoom}
          onRoomChange={handleRoomChange}
          onCreateRoom={handleCreateRoom}
          onLogout={handleLogout}
          disabled={loading}
        />
      </div>

      <div className="chat-content">
        {loading ? (
          <div className="chat-loading">
            <Loader size="large" />
          </div>
        ) : error ? (
          <div className="chat-error">
            <p>{error}</p>
          </div>
        ) : !currentRoom ? (
          <div className="chat-empty">
            <div className="empty-state-content">
              <h2>Welcome, {currentUser?.username}!</h2>
              <p>Select a room from the sidebar to start chatting.</p>
              <button className="toggle-sidebar-btn-mobile" onClick={toggleSidebar}>
                View Rooms
              </button>
            </div>
            <div className="user-profile-corner">
              <div
                className={`profile-circle ${currentUser?.avatar ? 'has-avatar' : ''}`}
                title={currentUser?.username}
                onClick={openProfileModal}
                style={{ cursor: 'pointer' }}
              >
                {currentUser?.avatar ? (
                  <img src={currentUser.avatar} alt="Avatar" className="profile-circle-img" />
                ) : (
                  currentUser?.username ? currentUser.username.charAt(0).toUpperCase() : '?'
                )}
              </div>
            </div>
          </div>
        ) : (
                    <>
            <div className="chat-header">
              <div className="header-left">
                <button
                  className="sidebar-toggle-btn"
                  onClick={toggleSidebar}
                  title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
                >
                  {isSidebarOpen ? '✕' : '☰'}
                </button>
                <h3>
                  <span style={{ opacity: 0.6 }}>#</span> {currentRoom}
                </h3>
              </div>
              <div className="header-right">
                <div
                  className={`profile-circle ${currentUser?.avatar ? 'has-avatar' : ''}`}
                  title={currentUser?.username}
                  onClick={openProfileModal}
                  style={{ cursor: 'pointer' }}
                >
                  {currentUser?.avatar ? (
                    <img src={currentUser.avatar} alt="Avatar" className="profile-circle-img" />
                  ) : (
                    currentUser?.username ? currentUser.username.charAt(0).toUpperCase() : '?'
                  )}
                </div>
              </div>
            </div>
            <div className="message-list-container">
              {isLoadingMessages ? (
                <div className="chat-loading">
                  <Loader size="medium" />
                </div>
              ) : (
                <MessageList
                  messages={messages}
                  currentUsername={currentUser?.username || ''}
                />
              )}
            </div>
            <MessageInput
              onSendMessage={handleSendMessage}
              disabled={!currentRoom || loading}
            />
          </>
        )}
      </div>

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={closeProfileModal}
        currentUser={currentUser}
      />
    </div>
  );
};

export default ChatPage;
