import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import io from 'socket.io-client';
import { API_BASE } from '../../config';
import Toast from 'react-native-toast-message';

export const NotificationContext = createContext();

// Use your actual server URL here
const SOCKET_URL = 'http://localhost:3000';

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);

  const fetchNotifications = useCallback(async (uid) => {
    try {
      const response = await axios.get(`${API_BASE}/notification/GetNotificationsByUser/${uid}`);
      const data = response.data;
      setNotifications(data);
      const unread = data.filter((n) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initializeSocket = async () => {
      try {
        const storedUid = await AsyncStorage.getItem('userUID');
        if (!storedUid) {
          setLoading(false);
          return;
        }

        // Initialize socket connection
        const newSocket = io(SOCKET_URL, {
          transports: ['websocket'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        });

        // Socket event handlers
        newSocket.on('connect', () => {
          console.log('Socket connected successfully');
          newSocket.emit('join_user_room', storedUid);
        });

        newSocket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
        });

        newSocket.on('new_notification', (newNotif) => {
          console.log('🔔 Real-time notification received:', newNotif);
          if (mounted) {
            setNotifications((prev) => [newNotif, ...prev]);
            setUnreadCount((prev) => prev + 1);
            
            // Show toast notification
            Toast.show({
              type: 'info',
              text1: 'New Notification',
              text2: newNotif.message,
              position: 'top',
              visibilityTime: 4000,
              autoHide: true,
              topOffset: 50,
            });
          }
        });

        newSocket.on('notification_updated', ({ notificationId, isRead }) => {
          console.log('Notification updated:', { notificationId, isRead });
          if (mounted) {
            setNotifications((prev) =>
              prev.map((n) => (n.id === notificationId ? { ...n, isRead } : n))
            );
            if (isRead) {
              setUnreadCount((prev) => Math.max(0, prev - 1));
            }
          }
        });

        setSocket(newSocket);
        await fetchNotifications(storedUid);

      } catch (err) {
        console.error('Error initializing socket:', err);
        setError('Failed to initialize notifications');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeSocket();

    return () => {
      mounted = false;
      if (socket) {
        socket.disconnect();
      }
    };
  }, [fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        setNotifications,
        fetchNotifications,
        unreadCount,
        setUnreadCount,
        loading,
        error,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
