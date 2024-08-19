import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const useSocket = (username) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (username) {
      const newSocket = io('http://localhost:5000/chat');
      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [username]);

  return socket;
};

export default useSocket;
