import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import SocketService from '../utils/socket';
import { API_BASE } from '../../config';
import Toast from 'react-native-toast-message';
import { Audio } from 'expo-av';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const socketInitialized = useRef(false);
  const processedNotifications = useRef(new Set());
  const notificationListenerId = useRef(null);

  const fetchNotifications = useCallback(async (uid) => {
    if (!uid) return;
    
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching notifications for user:', uid);
      const response = await axios.get(`${API_BASE}/notification/GetNotificationsByUser/${uid}`);
      console.log('Fetched notifications:', response.data);
      
      // Clear processed notifications set when fetching new notifications
      processedNotifications.current.clear();
      
      // Add fetched notifications to processed set
      response.data.forEach(notification => {
        if (notification.id) {
          processedNotifications.current.add(notification.id);
        }
      });
      const filteredNotifications = response.data.filter(notification => notification.itemType !== 'chat');
setNotifications(filteredNotifications);
setUnreadCount(filteredNotifications.filter(n => !n.isRead).length);

      
     
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize user ID and socket connection
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const uid = await AsyncStorage.getItem('userUID');
        if (uid && !socketInitialized.current) {
          console.log('Initializing user with ID:', uid);
          setUserId(uid);
          
          // Initialize socket
          const socket = SocketService.connect();
          
          // Set up notification listener
          SocketService.onNewNotification((notification) => {
            console.log('New notification received in context:', notification);
            // Play notification sound
            playNotificationSound();
            
            // Check if we've already processed this notification
            if (notification.id && processedNotifications.current.has(notification.id)) {
              console.log('Skipping duplicate notification:', notification.id);
              return;
            }
            
            // Add to processed set
            if (notification.id) {
              processedNotifications.current.add(notification.id);
            }
            
            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            // Show toast notification with custom styling based on notification type
            Toast.show({
              type: notification.itemType === 'campaign' ? 'success' : 'info',
              text1: notification.itemType === 'campaign' ? 'Campaign Update' : 'New Notification',
              text2: notification.message,
              position: 'top',
              visibilityTime: 4000,
              autoHide: true,
              topOffset: 50,
              props: {
                style: {
                  backgroundColor: '#FFFFFF',
                  borderRadius: 16,
                  padding: 16,
                  marginHorizontal: 16,
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 4,
                  },
                  shadowOpacity: 0.15,
                  shadowRadius: 12,
                  elevation: 8,
                  borderWidth: 1,
                  borderColor: 'rgba(0, 0, 0, 0.05)',
                  flexDirection: 'row',
                  alignItems: 'center',
                },
                text1Style: {
                  fontSize: 16,
                  fontWeight: '700',
                  color: '#1F2937',
                  marginBottom: 4,
                  fontFamily: 'System',
                },
                text2Style: {
                  fontSize: 14,
                  color: '#6B7280',
                  fontFamily: 'System',
                  lineHeight: 20,
                },
                containerStyle: {
                  backgroundColor: notification.itemType === 'campaign' ? '#F0FDF4' :
                                 notification.itemType === 'donation' ? '#F0FDF4' :
                                 notification.itemType === 'inNeed' ? '#EFF6FF' :
                                 notification.itemType === 'event' ? '#FFF7ED' :
                                 notification.itemType === 'payment' ? '#F0FDF4' : '#F9FAFB',
                  borderLeftWidth: 4,
                  borderLeftColor: notification.itemType === 'campaign' ? '#4CAF50' :
                                  notification.itemType === 'donation' ? '#4CAF50' :
                                  notification.itemType === 'inNeed' ? '#3B82F6' :
                                  notification.itemType === 'event' ? '#F97316' :
                                  notification.itemType === 'payment' ? '#4CAF50' : '#6B7280',
                },
                iconContainerStyle: {
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: notification.itemType === 'campaign' ? '#DCFCE7' :
                                  notification.itemType === 'donation' ? '#DCFCE7' :
                                  notification.itemType === 'inNeed' ? '#DBEAFE' :
                                  notification.itemType === 'event' ? '#FFEDD5' :
                                  notification.itemType === 'payment' ? '#DCFCE7' : '#F3F4F6',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 12,
                },
                iconStyle: {
                  fontSize: 20,
                },
                contentContainerStyle: {
                  flex: 1,
                },
              },
              icon: notification.itemType === 'campaign' ? '🎯' : 
                    notification.itemType === 'donation' ? '🎁' :
                    notification.itemType === 'inNeed' ? '📢' :
                    notification.itemType === 'event' ? '📅' :
                    notification.itemType === 'payment' ? '💰' : '📌',
            });
          });
          
          // Join notification room
          SocketService.joinUserNotificationRoom(uid);

          // Fetch initial notifications
          await fetchNotifications(uid);
          socketInitialized.current = true;
        }
      } catch (err) {
        console.error('Error initializing user:', err);
      }
    };

    initializeUser();

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up notification context');
      socketInitialized.current = false;
      processedNotifications.current.clear();
      SocketService.disconnect();
    };
  }, [fetchNotifications]);

  // Mark chat notifications as read for a set of message IDs
  const markChatNotificationsAsRead = async (messageIds) => {
    try {
      // Find all unread chat notifications for these message IDs
      const chatNotifsToMark = notifications.filter(
        n => n.itemType === 'chat' && !n.isRead && messageIds.includes(n.itemId)
      );
      for (const notif of chatNotifsToMark) {
        await axios.put(`${API_BASE}/notification/Updatenotification/${notif.id}`, { isRead: true });
      }
      // Update context state
      setNotifications(prev => prev.map(n =>
        (n.itemType === 'chat' && messageIds.includes(n.itemId)) ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => prev - chatNotifsToMark.length);
    } catch (err) {
      console.error('Error marking chat notifications as read:', err);
    }
  };

  // Play notification sound using expo-av
  async function playNotificationSound() {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/notification.mp3')
      );
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate(status => {
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (e) {
      console.log('Error playing notification sound:', e);
    }
  }

  const value = {
    notifications,
    setNotifications,
    unreadCount,
    setUnreadCount,
    loading,
    error,
    fetchNotifications,
    userId,
    markChatNotificationsAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
