// App.js
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Auth from './components/Auth';
import Chat from './components/Chat';
import './css/login.css';

const App = () => {
  const [socket, setSocket] = useState(null);
  const [token, setToken] = useState('');
  const [room, setRoom] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (token) {
      const newSocket = io('http://localhost:5000/chat', {
        auth: { token },
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [token]);

  useEffect(() => {
    if (socket) {
      socket.on('receiveMessage', (message) => {
        console.log('Received message:', message);
      });

      return () => {
        socket.off('receiveMessage');
      };
    }
  }, [socket]);

  useEffect(() => {
    if (socket && room) {
      socket.emit('joinRoom', room);
    }
  }, [socket, room]);

  return (
    <div className="app">
      {!token ? (
        <Auth setToken={setToken} />
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

export default App;
