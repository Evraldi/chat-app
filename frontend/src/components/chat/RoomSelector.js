import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '../common/Button';
import './RoomSelector.css';

/**
 * Room selector component
 */
const RoomSelector = ({
  rooms,
  currentRoom,
  onRoomChange,
  onCreateRoom,
  onLogout,
  disabled
}) => {
  const [newRoomName, setNewRoomName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Handle create room form submission
  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (newRoomName.trim() && !disabled) {
      onCreateRoom(newRoomName);
      setNewRoomName('');
      setShowCreateForm(false);
    }
  };

  return (
    <div className="room-selector-sidebar">
      <div className="room-selector-header">
        <h2>Chat Rooms</h2>
      </div>

      <div className="room-list">
        {rooms.map((room) => (
          <button
            key={room._id || room.name}
            className={`room-item ${currentRoom === room.name ? 'active' : ''}`}
            onClick={() => onRoomChange(room.name)}
            disabled={disabled}
          >
            <span className="room-icon">#</span>
            <span className="room-name">{room.name}</span>
          </button>
        ))}
      </div>

      <div className="room-selector-footer">
        {!showCreateForm ? (
          <Button
            variant="secondary"
            size="small"
            fullWidth
            onClick={() => setShowCreateForm(true)}
            disabled={disabled}
            className="create-room-btn"
          >
            + Create New Room
          </Button>
        ) : (
          <form className="create-room-form" onSubmit={handleCreateRoom}>
            <input
              type="text"
              className="create-room-input"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Room name"
              disabled={disabled}
              autoFocus
            />
            <div className="create-room-actions">
              <Button
                type="submit"
                variant="success"
                size="small"
                disabled={!newRoomName.trim() || disabled}
              >
                Create
              </Button>
              <Button
                variant="secondary"
                size="small"
                onClick={() => setShowCreateForm(false)}
                disabled={disabled}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        <div className="user-controls">
          <Button
            variant="danger"
            size="small"
            fullWidth
            onClick={onLogout}
            disabled={disabled}
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

RoomSelector.propTypes = {
  rooms: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      name: PropTypes.string.isRequired
    })
  ).isRequired,
  currentRoom: PropTypes.string.isRequired,
  onRoomChange: PropTypes.func.isRequired,
  onCreateRoom: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  disabled: PropTypes.bool
};

export default RoomSelector;
