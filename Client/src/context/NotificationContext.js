// import React, { createContext, useContext, useEffect, useState } from 'react';
// import SocketService from '../../src/utils/socket'; // your socket.js
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const NotificationContext = createContext();

// export const NotificationProvider = ({ children }) => {
//   const [notifications, setNotifications] = useState([]);
//   const [unreadCount, setUnreadCount] = useState(0);

//   useEffect(() => {
//     const setupSocket = async () => {
//       const uid = await AsyncStorage.getItem('Uid');
//       if (!uid) return;

//       const socket = SocketService.connect();

//       socket.emit('join_user_room', uid);

//       socket.on('new_inNeed_notification', (notification) => {
//         addNotification(notification);
//       });
//     };

//     setupSocket();

//     return () => {
//       SocketService.disconnect();
//     };
//   }, []);

//   const addNotification = (notif) => {
//     setNotifications((prev) => [notif, ...prev]);
//     setUnreadCount((count) => count + 1);
//   };

//   const markAllAsRead = () => {
//     setUnreadCount(0);
//   };

//   return (
//     <NotificationContext.Provider
//       value={{
//         notifications,
//         unreadCount,
//         addNotification,
//         markAllAsRead,
//         setNotifications,
//       }}
//     >
//       {children}
//     </NotificationContext.Provider>
//   );
// };

// export const useNotifications = () => useContext(NotificationContext);
import React, { createContext, useState, useEffect } from 'react';
import axios from "axios"

// Create context
export const NotificationContext = createContext();

// Provider component
export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
 

  // Function to fetch notifications
  const fetchNotifications = async () => {
   
    try {
      const response = await axios.get('http://172.20.10.2:3000/api/notification/GetAllnotification');
    
      const data = response.data
      setNotifications(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  // Fetch notifications once when the provider mounts
  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, fetchNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
}
