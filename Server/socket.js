let io;

module.exports = {
  init: (server) => {
    const { Server } = require("socket.io");
    io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"]
      },
      transports: ["websocket", "polling"],
      pingTimeout: 60000,
      pingInterval: 25000,
      upgradeTimeout: 30000,
      allowEIO3: true,
      path: '/socket.io'
    });

    io.on("connection", (socket) => {
      console.log("A user connected:", socket.id);

      // --- Rooms and Messaging ---
      socket.on("join_room", (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);
      });

      socket.on("leave_room", (roomId) => {
        socket.leave(roomId);
        console.log(`User ${socket.id} left room ${roomId}`);
      });

      socket.on("send_message", (data) => {
        io.in(data.roomId).emit("receive_message", {
          ...data,
          timestamp: new Date().toISOString(),
        });
      });

      socket.on("mark_as_read", (data) => {
        io.in(data.roomId).emit("messages_read", {
          messageIds: data.messageIds,
          timestamp: new Date().toISOString(),
        });
      });

      // --- InNeed Socket Logic ---
      socket.on("join_inNeed", (inNeedId) => {
        socket.join(`inNeed_${inNeedId}`);
        console.log(`User ${socket.id} joined inNeed room ${inNeedId}`);
      });

      socket.on("leave_inNeed", (inNeedId) => {
        socket.leave(`inNeed_${inNeedId}`);
        console.log(`User ${socket.id} left inNeed room ${inNeedId}`);
      });

      socket.on("post_comment", (comment) => {
        io.in(`inNeed_${comment.inNeedId}`).emit("new_comment", {
          ...comment,
          timestamp: new Date().toISOString(),
        });
      });

      // --- Admin Dashboard Notifications ---
      socket.on("join_admin_dashboard", () => {
        socket.join("admins");
        console.log(`Admin ${socket.id} joined admin dashboard for notifications`);
      });

      socket.on("new_inNeed_notification", (notification) => {
        io.to("admins").emit("new_inNeed_notification", {
          ...notification,
          timestamp: new Date().toISOString(),
        });
        console.log(`Sent new inNeed notification to admins`);
      });

      // --- User-Specific Notifications ---
      socket.on("join_user_room", (userId) => {
        const roomName = `user_${userId}`;
        socket.join(roomName);
        console.log(`User ${userId} joined personal room: ${roomName}`);
      });

      // Handle new notifications
      socket.on("new_notification", (notification) => {
        const { userId, message } = notification;
        if (userId) {
          const roomName = `user_${userId}`;
          console.log(`Emitting notification to room ${roomName}:`, notification);
          io.to(roomName).emit("new_notification", {
            ...notification,
            timestamp: new Date().toISOString(),
          });
        }
      });

      // Handle notification updates
      socket.on("mark_notification_as_read", ({ notificationId, userId }) => {
        const roomName = `user_${userId}`;
        console.log(`Marking notification ${notificationId} as read for user ${userId}`);
        io.to(roomName).emit("notification_updated", {
          notificationId,
          isRead: true,
          timestamp: new Date().toISOString(),
        });
      });

      socket.on("disconnect", (reason) => {
        console.log(`User disconnected: ${socket.id}, Reason: ${reason}`);
      });
    });

    return io;
  },

  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized!");
    }
    return io;
  },
};