const express = require('express');
const cors = require('cors');
const routers = require('./routers');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const Port = 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
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
    try {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);
    } catch (error) {
      console.error(`Error joining room ${roomId}:`, error.message);
    }
  });

  socket.on('leave_room', (roomId) => {
    try {
      socket.leave(roomId);
      console.log(`User ${socket.id} left room ${roomId}`);
    } catch (error) {
      console.error(`Error leaving room ${roomId}:`, error.message);
    }
  });

  socket.on('send_message', (data) => {
    try {
      console.log('Message received on server:', data);
      const roomId = data.roomId;
      console.log(`Broadcasting to room: ${roomId}`);
      
      // Broadcast to everyone in the room
      io.in(roomId).emit('receive_message', {
        ...data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error broadcasting message:', error.message);
    }
  });

  // Handle message read status
  socket.on('mark_as_read', (data) => {
    try {
      console.log('Marking messages as read:', data);
      const { roomId, messageIds } = data;
      
      // Broadcast read status to all users in the room
      io.in(roomId).emit('messages_read', {
        messageIds,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error marking messages as read:', error.message);
    }
  });

  socket.on('join_inNeed', (inNeedId) => {
    socket.join(`inNeed_${inNeedId}`);
    console.log(`User ${socket.id} joined inNeed room ${inNeedId}`);
  });

  socket.on('leave_inNeed', (inNeedId) => {
    socket.leave(`inNeed_${inNeedId}`);
    console.log(`User ${socket.id} left inNeed room ${inNeedId}`);
  });

  socket.on('post_comment', (comment) => {
    io.in(`inNeed_${comment.inNeedId}`).emit('new_comment', {
      ...comment,
      timestamp: new Date().toISOString()
    });
    
  });

  socket.on('join_inNeed', (inNeedId) => {
    socket.join(`inNeed_${inNeedId}`);
    console.log(`User ${socket.id} joined inNeed room ${inNeedId}`);
  });

  socket.on('leave_inNeed', (inNeedId) => {
    socket.leave(`inNeed_${inNeedId}`);
    console.log(`User ${socket.id} left inNeed room ${inNeedId}`);
  });

  socket.on('post_comment', (comment) => {
    io.in(`inNeed_${comment.inNeedId}`).emit('new_comment', {
      ...comment,
      timestamp: new Date().toISOString()
    });
    
  });

  socket.on('disconnect', (reason) => {
    console.log(`User disconnected: ${socket.id}, Reason: ${reason}`);
  });
});

// Start the server
server.listen(Port, () => {
  console.log(`Server is running on http://localhost:${Port}`);
});




