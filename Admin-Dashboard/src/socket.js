import { io } from 'socket.io-client';

const SOCKET_SERVER_URL = 'http://localhost:3000';

const socket = io(SOCKET_SERVER_URL, {
  transports: ['websocket'],
  reconnectionAttempts: 5,
  timeout: 10000,
});

// Join admins room on connect to receive notifications
socket.on('connect', () => {
  console.log('Socket connected:', socket.id);
  socket.emit('join_admin_dashboard');
});

// Listen for new notifications
socket.on('new_inNeed_notification', (notification) => {
  console.log('Received new notification:', notification);
  // TODO: Update your UI or state here with the new notification
});

// Optional: handle disconnects or errors
socket.on('disconnect', (reason) => {
  console.log('Socket disconnected:', reason);
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});

export default socket;

