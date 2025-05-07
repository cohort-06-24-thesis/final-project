const express = require('express');
const cors = require('cors');
const routers = require('./routers');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const Port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', routers);

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Adjust as needed for security
    methods: ['GET', 'POST']
  },
  transports: ['websocket'],
  pingTimeout: 60000
});

// Socket.IO logic
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on('leave_room', (roomId) => {
    socket.leave(roomId);
    console.log(`User ${socket.id} left room ${roomId}`);
  });

  socket.on('send_message', (data) => {
    console.log('Message received on server:', data);
    const roomId = data.roomId;
    console.log(`Broadcasting to room: ${roomId}`);
    
    // Broadcast to everyone in the room
    io.in(roomId).emit('receive_message', {
      ...data,
      timestamp: new Date().toISOString()
    });
  });

  // Handle message read status
  socket.on('mark_as_read', (data) => {
    console.log('Marking messages as read:', data);
    const { roomId, messageIds } = data;
    
    // Broadcast read status to all users in the room
    io.in(roomId).emit('messages_read', {
      messageIds,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start the server
server.listen(Port, () => {
  console.log(`Server is running on http://localhost:${Port}`);
});


