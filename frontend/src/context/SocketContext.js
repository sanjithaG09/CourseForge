import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useToast } from '../components/Toast';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { token, user } = useAuth();
  const toast = useToast();
  const socketRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [connected, setConnected] = useState(false);
  // Latest course event: { type: 'updated'|'published'|'deleted', course?, courseId?, ts }
  const [courseUpdate, setCourseUpdate] = useState(null);

  useEffect(() => {
    const socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:3000', {
      auth: token ? { token } : {},
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      if (user) socket.emit('join', user._id || user.id);
    });

    socket.on('disconnect', () => setConnected(false));

    socket.on('notification', (data) => {
      const id = Date.now();
      setNotifications((prev) => [
        { id, ...data, read: false },
        ...prev.slice(0, 19),
      ]);
      toast.info(data.message);
    });

    socket.on('course:updated', ({ course }) => {
      setCourseUpdate({ type: 'updated', course, ts: Date.now() });
    });

    socket.on('course:published', ({ course }) => {
      setCourseUpdate({ type: 'published', course, ts: Date.now() });
    });

    socket.on('course:deleted', ({ courseId }) => {
      setCourseUpdate({ type: 'deleted', courseId, ts: Date.now() });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, user]);

  const markRead = (id) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

  const clearAll = () => setNotifications([]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <SocketContext.Provider value={{ connected, notifications, unreadCount, markRead, clearAll, courseUpdate }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
