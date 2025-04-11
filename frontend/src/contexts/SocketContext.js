import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import config from '../config/config';
import { useAuth } from './AuthContext';

// Create context
const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);

  // Connect to socket when user is authenticated
  useEffect(() => {
    let newSocket;

    if (currentUser) {
      console.log('Attempting to connect socket with user:', currentUser.username);

      // Try both socket URLs to ensure compatibility
      const socketUrl = config.socketUrl || 'http://localhost:5000/chat';
      console.log('Using socket URL:', socketUrl);

      // Get token from localStorage
      const token = localStorage.getItem('token');
      console.log('Token available:', !!token);

      // Create new socket connection
      newSocket = io(socketUrl, {
        auth: token ? { token } : undefined,
        transports: ['websocket', 'polling'], // Try both transports
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000 // Increase timeout
      });

      // Set up event listeners
      newSocket.on('connect', () => {
        console.log('Socket connected successfully');
        setConnected(true);
        setError(null);
      });

      newSocket.on('connect_error', (err) => {
        console.error('Socket connection error:', err.message);
        setError(`Failed to connect to chat server: ${err.message}`);
        setConnected(false);

        // Try to reconnect with different transport
        if (newSocket.io.opts.transports.includes('websocket')) {
          console.log('Retrying with polling transport...');
          newSocket.io.opts.transports = ['polling'];
        }
      });

      newSocket.on('disconnect', (reason) => {
        console.log('Socket disconnected, reason:', reason);
        setConnected(false);
      });

      // Save socket instance
      setSocket(newSocket);

      // Clean up on unmount
      return () => {
        if (newSocket) {
          console.log('Disconnecting socket on cleanup');
          newSocket.disconnect();
        }
      };
    } else {
      // Disconnect if user logs out
      if (socket) {
        console.log('User logged out, disconnecting socket');
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
    }
  }, [currentUser]);  // Remove socket from dependencies to prevent reconnection loops

  // Join a room
  const joinRoom = useCallback((room) => {
    if (!socket) {
      console.error('Cannot join room: Socket not initialized');
      setError('Socket not initialized');
      return;
    }

    if (!connected) {
      console.error('Cannot join room: Socket not connected');
      setError('Not connected to chat server');
      return;
    }

    if (!currentUser) {
      console.error('Cannot join room: No current user');
      setError('User not authenticated');
      return;
    }

    console.log(`Joining room ${room} as ${currentUser.username}`);
    socket.emit('joinRoom', { room, username: currentUser.username });
  }, [socket, connected, currentUser, setError]);

  // Send a message
  const sendMessage = useCallback((text, room) => {
    return new Promise((resolve, reject) => {
      if (!socket) {
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
      socket.emit('sendMessage',
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
  }, [socket, connected, currentUser]);

  // Context value
  const value = {
    socket,
    connected,
    error,
    joinRoom,
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
