import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    this.socket = io(SOCKET_URL);
    
    this.socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  // Join a room
  joinRoom(roomId) {
    if (this.socket) {
      this.socket.emit('join_room', roomId);
    }
  }

  // Leave a room
  leaveRoom(roomId) {
    if (this.socket) {
      this.socket.emit('leave_room', roomId);
    }
  }

  // Send a message
  sendMessage(roomId, message) {
    if (this.socket) {
      this.socket.emit('send_message', {
        roomId,
        message,
        userId: this.socket.id
      });
    }
  }

  // Listen for messages
  onReceiveMessage(callback) {
    if (this.socket) {
      this.socket.on('receive_message', callback);
    }
  }
}

export default new SocketService(); 