import React from 'react';

const RoomSelection = ({ rooms, room, setRoom, onCreateRoom }) => {
  return (
    <div className="room-selection">
      <select value={room} onChange={(e) => setRoom(e.target.value)}>
        <option value="">Select a room</option>
        {Array.isArray(rooms) && rooms.map((r, index) => (
          <option key={index} value={r.name}>
            {r.name}
          </option>
        ))}
      </select>
      <button onClick={onCreateRoom}>Create Room</button>
    </div>
  );
};

export default RoomSelection;
