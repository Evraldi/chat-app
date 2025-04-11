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

  // Handle room selection
  const handleRoomChange = (e) => {
    onRoomChange(e.target.value);
  };

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
    <div className="room-selector">
      <div className="room-selector-header">
        <h2>Chat Rooms</h2>
        <Button 
          variant="danger" 
          size="small" 
          onClick={onLogout}
          disabled={disabled}
        >
          Logout
        </Button>
      </div>

      <div className="room-selector-content">
        <select
          className="room-select"
          value={currentRoom}
          onChange={handleRoomChange}
          disabled={disabled}
        >
          <option value="">Select a room</option>
          {rooms.map((room) => (
            <option key={room._id || room.name} value={room.name}>
              {room.name}
            </option>
          ))}
        </select>

        {!showCreateForm ? (
          <Button 
            variant="secondary" 
            size="small" 
            onClick={() => setShowCreateForm(true)}
            disabled={disabled}
          >
            Create Room
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
