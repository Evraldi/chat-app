import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';
import RoomSelector from './RoomSelector';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import Loader from '../common/Loader';
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

  // Handle room change
  const handleRoomChange = (roomName) => {
    setRoom(roomName);
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

  return (
    <div className="chat-page">
      <RoomSelector
        rooms={rooms}
        currentRoom={currentRoom}
        onRoomChange={handleRoomChange}
        onCreateRoom={handleCreateRoom}
        onLogout={handleLogout}
        disabled={loading}
      />

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
            <p>Please select a room to start chatting</p>
          </div>
        ) : (
          <>
            <MessageList
              messages={messages}
              currentUsername={currentUser?.username || ''}
            />
            <MessageInput
              onSendMessage={handleSendMessage}
              disabled={!currentRoom || loading}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
