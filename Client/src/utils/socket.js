// socketService.js
import { io } from 'socket.io-client';
import { API_BASE } from '../../config';

// Extract the base URL from API_BASE (remove /api if present)
const SOCKET_URL = API_BASE.replace('/api', '');

let socket = null;
let notificationCallback = null;
let activeListeners = new Set();

const connect = () => {
  if (!socket) {
    console.log('Connecting to socket server at:', SOCKET_URL);
    socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      path: '/socket.io',
      forceNew: true,
      autoConnect: true
    });

    socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }
  return socket;
};

const disconnect = () => {
  if (socket) {
    // Remove all listeners before disconnecting
    socket.off('new_notification');
    socket.off('connect');
    socket.off('disconnect');
    socket.off('connect_error');
    socket.disconnect();
    socket = null;
    notificationCallback = null;
    activeListeners.clear();
  }
};

// -------------------- Rooms and Messaging --------------------

const joinRoom = (roomId) => {
  if (socket) {
    socket.emit('join_room', roomId);
    console.log(`Joining room: ${roomId}`);
  }
};

const leaveRoom = (roomId) => {
  if (socket) {
    socket.emit('leave_room', roomId);
    console.log(`Leaving room: ${roomId}`);
  }
};

const sendMessage = (roomId, message) => {
  if (socket) {
    socket.emit('send_message', {
      roomId,
      message,
      userId: socket.id,
    });
  }
};

const onReceiveMessage = (callback) => {
  if (socket) {
    socket.on('receive_message', callback);
  }
};

// -------------------- ✅ Notifications --------------------

const joinUserNotificationRoom = (userId) => {
  if (socket && userId) {
    const roomName = `user_${userId}`;
    console.log(`Attempting to join notification room for user: ${userId}`);
    
    // Remove any existing connect listener for this user
    socket.off('connect');
    
    // Set up a single connect listener
    socket.on('connect', () => {
      console.log(`Re-joining notification room after reconnect: ${roomName}`);
      socket.emit('join_user_room', userId);
    });
    
    // Join the room
    socket.emit('join_user_room', userId);
    console.log(`Joined notification room: ${roomName}`);
  }
};

const onNewNotification = (callback) => {
  if (socket) {
    const listenerId = Math.random().toString(36).substring(7);
    console.log(`Setting up notification listener: ${listenerId}`);
    
    // Remove any existing notification listeners
    socket.off('new_notification');
    activeListeners.clear();
    
    // Store the callback
    notificationCallback = callback;
    
    // Set up new listener
    socket.on('new_notification', (notification) => {
      console.log(`Listener ${listenerId} received notification:`, notification);
      if (notificationCallback) {
        notificationCallback(notification);
      }
    });
    
    activeListeners.add(listenerId);
    console.log(`Active notification listeners:`, Array.from(activeListeners));
  }
};

const onNewInNeedNotification = (callback) => {
  if (socket) {
    socket.off('new_inNeed_notification');
    socket.on('new_inNeed_notification', callback);
  }
};

// -------------------- Export Singleton API --------------------

const SocketService = {
  connect,
  disconnect,
  joinRoom,
  leaveRoom,
  sendMessage,
  onReceiveMessage,
  joinUserNotificationRoom,
  onNewInNeedNotification,
  onNewNotification,
};

export default SocketService;

