import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem('token');
    // In dev the CRA proxy forwards to Express; in production same origin serves both
    const socketUrl = process.env.REACT_APP_SOCKET_URL || (process.env.NODE_ENV === 'production' ? window.location.origin : 'http://localhost:5000');
    const s = io(socketUrl, {
      auth: { token },
      autoConnect: true,
    });
    setSocket(s);
    return () => s.disconnect();
  }, [user]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);
