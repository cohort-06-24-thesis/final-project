const { Notification } = require("../Database/index.js");
const socketIO = require("../socket.js");

module.exports = {
  // Create new notification
  createNotif: async (req, res) => {
    try {
      const notification = await Notification.create({
        message: req.body.message,
        isRead: false,
        UserId: req.body.UserId,
        itemId: req.body.itemId,
        itemType: req.body.itemType,
      });

      // Emit the notification through socket
      const io = socketIO.getIO();
      io.to(`user_${req.body.UserId}`).emit("new_notification", {
        ...notification.toJSON(),
        timestamp: new Date().toISOString(),
      });

      res.status(201).json(notification);
    } catch (error) {
      console.error("Error creating notification:", error);
      res.status(500).json({
        message: error.message || "Error creating notification",
      });
    }
  },

  // Test notification endpoint
  testNotification: async (req, res) => {
    try {
      const { userId, message } = req.body;
      if (!userId || !message) {
        return res.status(400).json({ message: "userId and message are required" });
      }

      const notification = await Notification.create({
        message,
        isRead: false,
        UserId: userId,
      });

      // Emit the notification through socket
      const io = socketIO.getIO();
      io.to(`user_${userId}`).emit("new_notification", {
        ...notification.toJSON(),
        timestamp: new Date().toISOString(),
      });

      res.status(201).json({ message: "Test notification sent", notification });
    } catch (error) {
      console.error("Error sending test notification:", error);
      res.status(500).json({
        message: error.message || "Error sending test notification",
      });
    }
  },

  getUnseenCount: async (req, res) => {
    try {
      const count = await Notification.count({
        where: { isRead: false },
      });
      res.status(200).json({ unseenCount: count });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching unseen notifications count" });
    }
  },

  // Get all notifications
  findAllNotif: async (req, res) => {
    try {
      const notifications = await Notification.findAll({
        order: [["createdAt", "DESC"]], // optional: newest first
      });
      res.status(200).json(notifications);
    } catch (error) {
      res.status(500).json({
        message: error.message || "Error retrieving notifications",
      });
    }
  },

  // Get single notification
  findOneNotif: async (req, res) => {
    try {
      const notification = await Notification.findByPk(req.params.id);
      if (notification) {
        res.status(200).json(notification);
      } else {
        res.status(404).json({
          message: `Notification with id ${req.params.id} not found`,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: error.message || "Error retrieving notification",
      });
    }
  },

  // Update notification (only allow message and isRead)
  updateNotif: async (req, res) => {
    try {
      const allowedUpdates = {};
      if (req.body.message !== undefined)
        allowedUpdates.message = req.body.message;
      if (req.body.isRead !== undefined)
        allowedUpdates.isRead = req.body.isRead;

      const result = await Notification.update(allowedUpdates, {
        where: { id: req.params.id },
      });

      if (result[0] === 1) {
        const updatedNotif = await Notification.findByPk(req.params.id);
        res.status(200).json(updatedNotif);
      } else {
        res.status(404).json({
          message: `Notification with id ${req.params.id} not found`,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: error.message || "Error updating notification",
      });
    }
  },
  getNotificationsByUserId: async (req, res) => {
    try {
      const { userId } = req.params;

      const notifications = await Notification.findAll({
        where: { UserId: userId }, 
        order: [["createdAt", "DESC"]],
      });

      res.status(200).json(notifications);
    } catch (error) {
      res.status(500).json({
        message:
          error.message || `Error retrieving notifications for user ${userId}`,
      });
    }
  },

  // Delete notification
  deleteNotif: async (req, res) => {
    try {
      const result = await Notification.destroy({
        where: { id: req.params.id },
      });
      if (result === 1) {
        res.status(200).json({
          message: "Notification deleted successfully",
        });
      } else {
        res.status(404).json({
          message: `Notification with id ${req.params.id} not found`,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: error.message || "Error deleting notification",
      });
    }
  },
};
