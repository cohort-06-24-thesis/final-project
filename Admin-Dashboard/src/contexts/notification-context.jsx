import { createContext, useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import socket from "@/socket";
import { toast } from "react-toastify";

const NotificationContext = createContext();
export const useNotification = () => useContext(NotificationContext);

const NOTIF_KEY = "admin_notifications";
const UNSEEN_KEY = "unseen_count";

// Common toast configuration
const toastConfig = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  style: {
    background: "#fff",
    color: "#333",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
};

export const NotificationProvider = ({ children }) => {
  const [unseenCount, setUnseenCount] = useState(() => {
    const stored = localStorage.getItem(UNSEEN_KEY);
    return stored ? parseInt(stored, 10) : 0;
  });

  const [notifications, setNotifications] = useState(() => {
    const stored = localStorage.getItem(NOTIF_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  const socketUpdatedRef = useRef(false);

  const saveToStorage = (notifs, unseen) => {
    localStorage.setItem(NOTIF_KEY, JSON.stringify(notifs));
    localStorage.setItem(UNSEEN_KEY, unseen.toString());
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/notification/GetAllnotification");
      const filteredNotifications = res.data.filter(notification => notification.itemType !== 'chat');
      setNotifications(filteredNotifications || []);
      localStorage.setItem(NOTIF_KEY, JSON.stringify(filteredNotifications || []));
    } catch (err) {
      console.error("❌ Failed to fetch notifications:", err);
    }
  };

  const fetchUnseenCount = async () => {
    try {
      if (socketUpdatedRef.current) return;
      const res = await axios.get("http://localhost:3000/api/notification/unseen-count");
      setUnseenCount(res.data.unseenCount || 0);
      localStorage.setItem(UNSEEN_KEY, (res.data.unseenCount || 0).toString());
    } catch (err) {
      console.error("❌ Failed to fetch unseen count:", err);
    }
  };

  const markAllSeen = async () => {
    try {
      await axios.patch("http://localhost:3000/api/notification/mark-all-seen");
      setUnseenCount(0);
      localStorage.setItem(UNSEEN_KEY, "0");
    } catch (err) {
      console.error("❌ Failed to mark notifications as seen:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUnseenCount();

    socket.emit("join_admin_dashboard");

    socket.on("new_inNeed_notification", (data) => {
      console.log("✅ New inNeed notification received via socket:", data);
      socketUpdatedRef.current = true;

      if (data.itemType !== 'chat') {
        const updatedNotifications = [data, ...notifications];
        const newUnseenCount = unseenCount + 1;

        setNotifications(updatedNotifications);
        setUnseenCount(newUnseenCount);
        saveToStorage(updatedNotifications, newUnseenCount);

        toast.info(
          <div>
            <p className="font-semibold">New In-Need Request! 📢</p>
            <p>{data.message}</p>
          </div>,
          toastConfig
        );
      }
    });

    socket.on("new_donation_notification", (data) => {
      console.log("✅ New donation notification received via socket:", data);
      socketUpdatedRef.current = true;

      if (data.itemType !== 'chat') {
        const updatedNotifications = [data, ...notifications];
        const newUnseenCount = unseenCount + 1;

        setNotifications(updatedNotifications);
        setUnseenCount(newUnseenCount);
        saveToStorage(updatedNotifications, newUnseenCount);

        toast.info(
          <div>
            <p className="font-semibold">New Donation Item! 🎁</p>
            <p>{data.message}</p>
          </div>,
          toastConfig
        );
      }
    });

    socket.on("new_campaign_notification", (data) => {
      console.log("✅ New campaign notification received via socket:", data);
      socketUpdatedRef.current = true;

      if (data.itemType !== 'chat') {
        const updatedNotifications = [data, ...notifications];
        const newUnseenCount = unseenCount + 1;

        setNotifications(updatedNotifications);
        setUnseenCount(newUnseenCount);
        saveToStorage(updatedNotifications, newUnseenCount);

        toast.info(
          <div>
            <p className="font-semibold">New Campaign! 🎯</p>
            <p>{data.message}</p>
          </div>,
          toastConfig
        );
      }
    });

    socket.on("new_event_notification", (data) => {
      console.log("✅ New event notification received via socket:", data);
      socketUpdatedRef.current = true;

      if (data.itemType !== 'chat') {
        const updatedNotifications = [data, ...notifications];
        const newUnseenCount = unseenCount + 1;

        setNotifications(updatedNotifications);
        setUnseenCount(newUnseenCount);
        saveToStorage(updatedNotifications, newUnseenCount);

        toast.info(
          <div>
            <p className="font-semibold">New Event! 📅</p>
            <p>{data.message}</p>
          </div>,
          toastConfig
        );
      }
    });

    socket.on("new_payment_notification", (data) => {
      console.log("✅ New payment notification received via socket:", data);
      socketUpdatedRef.current = true;

      if (data.itemType !== 'chat') {
        const updatedNotifications = [data, ...notifications];
        const newUnseenCount = unseenCount + 1;

        setNotifications(updatedNotifications);
        setUnseenCount(newUnseenCount);
        saveToStorage(updatedNotifications, newUnseenCount);

        toast.success(
          <div>
            <p className="font-semibold">New Payment Received! 💰</p>
            <p>{data.message}</p>
          </div>,
          toastConfig
        );
      }
    });

    return () => {
      socket.off("new_inNeed_notification");
      socket.off("new_donation_notification");
      socket.off("new_campaign_notification");
      socket.off("new_event_notification");
      socket.off("new_payment_notification");
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
