import React, { createContext, useContext, useState } from 'react';
import useSocket from './useSocket';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [username, setUsername] = useState('');
  const socket = useSocket(username);

  return (
    <SocketContext.Provider value={{ socket, setUsername, username }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => useContext(SocketContext);
