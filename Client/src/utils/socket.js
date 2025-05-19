
// socketService.js
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000'; 

let socket = null;

const connect = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });
  }
  return socket;
};

const disconnect = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// -------------------- Rooms and Messaging --------------------

const joinRoom = (roomId) => {
  socket?.emit('join_room', roomId);
};

const leaveRoom = (roomId) => {
  socket?.emit('leave_room', roomId);
};

const sendMessage = (roomId, message) => {
  socket?.emit('send_message', {
    roomId,
    message,
    userId: socket.id,
  });
};

const onReceiveMessage = (callback) => {
  socket?.on('receive_message', callback);
};

// -------------------- ✅ Notifications --------------------

const joinUserNotificationRoom = (userId) => {
  if (socket && userId) {
    socket.emit('join_user_room', userId);
    console.log(`Joined notification room: user_${userId}`);
  }
};

const onNewInNeedNotification = (callback) => {
  socket?.on('new_inNeed_notification', callback);
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
};

export default SocketService;

