import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import io from 'socket.io-client';
import config from '../config/config';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);
  const prevUsernameRef = useRef(null);

  useEffect(() => {
    if (currentUser && currentUser.username !== prevUsernameRef.current) {
      console.log('Username changed, connecting socket for user:', currentUser.username);

      // Disconnect existing socket if username changed
      if (socketRef.current) {
        console.log('Disconnecting previous socket due to username change');
        socketRef.current.disconnect();
        socketRef.current = null;
        setConnected(false);
      }

      const socketUrl = config.socketUrl || 'http://localhost:5000/chat';
      const token = localStorage.getItem('token');

      const newSocket = io(socketUrl, {
        auth: token ? { token } : undefined,
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000
      });

      newSocket.on('connect', () => {
        console.log('Socket connected successfully');
        setConnected(true);
        setError(null);
      });

      newSocket.on('connect_error', (err) => {
        console.error('Socket connection error:', err.message);
        setError(`Failed to connect to chat server: ${err.message}`);
        setConnected(false);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('Socket disconnected, reason:', reason);
        setConnected(false);
      });

      socketRef.current = newSocket;
      prevUsernameRef.current = currentUser.username;

      return () => {
        // Don't disconnect on cleanup, keep socket alive
      };
    } else if (!currentUser) {
      // User logged out
      if (socketRef.current) {
        console.log('User logged out, disconnecting socket');
        socketRef.current.disconnect();
        socketRef.current = null;
        setConnected(false);
        prevUsernameRef.current = null;
      }
    }
  }, [currentUser]);

  const joinRoom = useCallback((room) => {
    if (!socketRef.current) {
      console.error('Cannot join room: Socket not initialized');
      setError('Socket not initialized');
      return;
    }

    if (!connected) {
      console.error('Cannot join room: Socket not connected');
      setError('Not connected to chat server');
      return;
    }

    if (!currentUser || !currentUser.username) {
      console.error('Cannot join room: No current user or username missing', currentUser);
      setError('User not authenticated or invalid session');
      return;
    }

    console.log(`Joining room ${room} as ${currentUser.username}`);
    socketRef.current.emit('joinRoom', { room, username: currentUser.username });
  }, [connected, currentUser, setError]);

  const leaveRoom = useCallback((room) => {
    if (!socketRef.current || !connected || !currentUser) return;

    console.log(`Leaving room ${room} as ${currentUser.username}`);
    socketRef.current.emit('leaveRoom', { room, username: currentUser.username });
  }, [connected, currentUser]);

  const sendMessage = useCallback((text, room) => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current) {
        const error = new Error('Socket not initialized');
        console.error(error);
        reject(error);
        return;
      }

      if (!connected) {
        const error = new Error('Not connected to chat server');
        console.error(error);
        reject(error);
        return;
      }

      if (!currentUser) {
        const error = new Error('User not authenticated');
        console.error(error);
        reject(error);
        return;
      }

      console.log(`Sending message to room ${room}: ${text}`);
      console.log('Current user:', currentUser);
      socketRef.current.emit('sendMessage',
        {
          text,
          room,
          username: currentUser.username
        },
        (response) => {
          if (response && response.status === 'ok') {
            console.log('Message sent successfully');
            resolve(response);
          } else {
            const errorMsg = (response && response.message) || 'Failed to send message';
            console.error('Error sending message:', errorMsg);
            reject(new Error(errorMsg));
          }
        }
      );
    });
  }, [connected, currentUser]);

  const value = {
    socket: socketRef.current,
    connected,
    error,
    joinRoom,
    leaveRoom,
    sendMessage
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook to use the socket context
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export default SocketContext;
