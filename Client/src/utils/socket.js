// import { io } from 'socket.io-client';

// const SOCKET_URL = 'http://localhost:3000';

// class SocketService {
//   constructor() {
//     this.socket = null;
//   }

//   connect() {
//     this.socket = io(SOCKET_URL);
    
//     this.socket.on('connect', () => {
//       console.log('Connected to socket server');
//     });

//     this.socket.on('disconnect', () => {
//       console.log('Disconnected from socket server');
//     });

//     return this.socket;
//   }

//   disconnect() {
//     if (this.socket) {
//       this.socket.disconnect();
//     }
//   }

//   // Join a room
//   joinRoom(roomId) {
//     if (this.socket) {
//       this.socket.emit('join_room', roomId);
//     }
//   }

//   // Leave a room
//   leaveRoom(roomId) {
//     if (this.socket) {
//       this.socket.emit('leave_room', roomId);
//     }
//   }

//   // Send a message
//   sendMessage(roomId, message) {
//     if (this.socket) {
//       this.socket.emit('send_message', {
//         roomId,
//         message,
//         userId: this.socket.id
//       });
//     }
//   }

//   // Listen for messages
//   onReceiveMessage(callback) {
//     if (this.socket) {
//       this.socket.on('receive_message', callback);
//     }
//   }
// }

// export default new SocketService(); 
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000'; // Replace with IP if testing on device

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
    });

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

  // -------------------- Rooms and Messaging --------------------

  joinRoom(roomId) {
    if (this.socket) {
      this.socket.emit('join_room', roomId);
    }
  }

  leaveRoom(roomId) {
    if (this.socket) {
      this.socket.emit('leave_room', roomId);
    }
  }

  sendMessage(roomId, message) {
    if (this.socket) {
      this.socket.emit('send_message', {
        roomId,
        message,
        userId: this.socket.id,
      });
    }
  }

  onReceiveMessage(callback) {
    if (this.socket) {
      this.socket.on('receive_message', callback);
    }
  }

  // -------------------- ✅ Notifications --------------------

  joinUserNotificationRoom(userId) {
    if (this.socket && userId) {
      this.socket.emit('join_user_room', userId);
      console.log(`Joined notification room: user_${userId}`);
    }
  }

  onNewInNeedNotification(callback) {
    if (this.socket) {
      this.socket.on('new_inNeed_notification', callback);
    }
  }

  // Optional: You can add other types like campaign/event notifications
}

export default new SocketService();
