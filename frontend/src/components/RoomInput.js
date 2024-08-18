// RoomInput.js
import React from 'react';

const RoomInput = ({ room, setRoom }) => {
  const handleChange = (e) => {
    setRoom(e.target.value);
  };

  return (
    <div className="room-input">
      <h2>Join Room</h2>
      <input
        type="text"
        value={room}
        onChange={handleChange}
        placeholder="Enter room name"
        required
      />
    </div>
  );
};

export default RoomInput;
