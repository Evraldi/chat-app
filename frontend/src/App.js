import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Auth from './components/Auth';
import Chat from './components/Chat';
import './css/login.css';

const socket = io('http://localhost:5000/chat');  // Namespace yang benar

const App = () => {
  const [token, setToken] = useState('');
  const [room, setRoom] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (token && room) {
      socket.emit('joinRoom', room);
    }

    socket.on('receiveMessage', (message) => {
      // Handle received message
      console.log('Received message:', message);
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [token, room]);

  return (
    <div className="app">
      {!token ? (
        <Auth setToken={setToken} />
      ) : (
        <Chat
          socket={socket}
          room={room}
          setRoom={setRoom}
          username={username}
          setUsername={setUsername}
        />
      )}
    </div>
  );
};

export default App;
