import React, { useState } from 'react';
import { SocketProvider, useSocketContext } from './components/socket/SocketContext';
import Auth from './components/Auth';
import Chat from './components/Chat';
import './css/chat.css';

const AppContent = () => {
  const { socket, setUsername, username } = useSocketContext();
  const [room, setRoom] = useState('');

  return (
    <div className="app">
      {!username ? (
        <Auth setUsername={setUsername} />
      ) : (
        socket && (
          <Chat
            socket={socket}
            room={room}
            setRoom={setRoom}
            username={username}
            setUsername={setUsername}
          />
        )
      )}
    </div>
  );
};

const App = () => (
  <SocketProvider>
    <AppContent />
  </SocketProvider>
);

export default App;
