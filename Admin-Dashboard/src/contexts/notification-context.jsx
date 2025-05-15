import { createContext, useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import socket from "@/socket";
import { toast } from "react-toastify";

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [unseenCount, setUnseenCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const socketUpdatedRef = useRef(false);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/notification/GetAllnotification");
      setNotifications(res.data || []);
    } catch (err) {
      console.error("❌ Failed to fetch notifications:", err);
    }
  };

  const fetchUnseenCount = async () => {
    try {
      if (socketUpdatedRef.current) return; // skip if already handled by socket
      const res = await axios.get("http://localhost:3000/api/notification/unseen-count");
      setUnseenCount(res.data.unseenCount || 0);
    } catch (err) {
      console.error("❌ Failed to fetch unseen count:", err);
    }
  };

  const markAllSeen = async () => {
    try {
      await axios.patch("http://localhost:3000/api/notification/mark-all-seen");
      setUnseenCount(0);
    } catch (err) {
      console.error("❌ Failed to mark notifications as seen:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUnseenCount();

    socket.emit("join_admin_dashboard");

    socket.on("new_inNeed_notification", (data) => {
      console.log("✅ New notification received via socket:", data);
      socketUpdatedRef.current = true;
      setUnseenCount((prev) => prev + 1);
      setNotifications((prev) => [data, ...prev]);
      toast.info(data.message || "📢 New notification!");
    });

    return () => {
      socket.off("new_inNeed_notification");
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        unseenCount,
        notifications,
        fetchUnseenCount,
        fetchNotifications,
        markAllSeen,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
