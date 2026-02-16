import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';
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
    error,
    setRoom,
    createRoom,
    sendMessage
  } = useChat();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Handle room change
  const handleRoomChange = (roomName) => {
    setRoom(roomName);
    // On mobile, close sidebar after selection
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  // Handle room creation
  const handleCreateRoom = async (roomName) => {
    try {
      await createRoom(roomName);
      setRoom(roomName);
    } catch (err) {
      console.error('Error creating room:', err);
    }
  };

  // Handle message sending
  const handleSendMessage = async (text) => {
    try {
      console.log('ChatPage: Sending message:', text);
      await sendMessage(text);
      return true;
    } catch (err) {
      console.error('ChatPage: Error sending message:', err.message);
      // Show error to user
      alert(`Failed to send message: ${err.message}`);
      return false;
    }
  };

  // Handle logout
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
        <button
          className="sidebar-toggle-btn"
          onClick={toggleSidebar}
          title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isSidebarOpen ? '❮' : '❯'}
        </button>
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
                className="profile-circle"
                title={currentUser?.username}
                onClick={openProfileModal}
                style={{ cursor: 'pointer' }}
              >
                {currentUser?.username ? currentUser.username.charAt(0).toUpperCase() : '?'}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="chat-header">
              <div className="header-left">
                <h3>
                  <span style={{ opacity: 0.6 }}>#</span> {currentRoom}
                </h3>
              </div>
              <div className="header-right">
                <span className="room-status">Active</span>
                <div
                  className="profile-circle"
                  title={currentUser?.username}
                  onClick={openProfileModal}
                  style={{ cursor: 'pointer' }}
                >
                  {currentUser?.username ? currentUser.username.charAt(0).toUpperCase() : '?'}
                </div>
              </div>
            </div>
            <div className="message-list-container">
              {loading ? (
                <div className="chat-loading">
                  <Loader size="medium" />
                </div>
              ) : (
                <MessageList
                  messages={messages}
                  currentUsername={currentUser?.username || ''}
                  key={currentRoom} // Force remount only when room changes
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
