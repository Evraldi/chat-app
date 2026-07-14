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
      // Disconnect existing socket if username changed
      if (socketRef.current) {
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
        setConnected(true);
        setError(null);
      });

      newSocket.on('connect_error', (err) => {
        setError(`Failed to connect to chat server: ${err.message}`);
        setConnected(false);
      });

      newSocket.on('disconnect', () => {
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
        socketRef.current.disconnect();
        socketRef.current = null;
        setConnected(false);
        prevUsernameRef.current = null;
      }
    }
  }, [currentUser]);

  const joinRoom = useCallback((room) => {
    if (!socketRef.current) {
      setError('Socket not initialized');
      return;
    }

    if (!connected) {
      setError('Not connected to chat server');
      return;
    }

    if (!currentUser || !currentUser.username) {
      setError('User not authenticated or invalid session');
      return;
    }

    socketRef.current.emit('joinRoom', { room });
  }, [connected, currentUser]);

  const leaveRoom = useCallback((room) => {
    if (!socketRef.current || !connected || !currentUser) return;
    socketRef.current.emit('leaveRoom', { room });
  }, [connected, currentUser]);

  const sendMessage = useCallback((payload, room) => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current) {
        reject(new Error('Socket not initialized'));
        return;
      }

      if (!connected) {
        reject(new Error('Not connected to chat server'));
        return;
      }

      if (!currentUser) {
        reject(new Error('User not authenticated'));
        return;
      }

      socketRef.current.emit('sendMessage',
        { ...payload, room },
        (response) => {
          if (response && response.status === 'ok') {
            resolve(response);
          } else {
            const errorMsg = (response && response.message) || 'Failed to send message';
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

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export default SocketContext;
