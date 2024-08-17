import React from 'react';

const RoomInput = ({ room, setRoom }) => {
  return (
    <div className="room-input">
      <h2>Join Room</h2>
      <input value={room} onChange={(e) => setRoom(e.target.value)} placeholder="Room" />
    </div>
  );
};

export default RoomInput;
