import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const SOCKET_SERVER_URL = 'http://localhost:3000';
const API_URL = 'http://localhost:3000/api/notification/GetAllnotification';

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(API_URL);
        setNotifications(response.data);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();

    const socket = io(SOCKET_SERVER_URL, { transports: ['websocket'] });

    socket.on('connect', () => {
      socket.emit('join_admin_dashboard');
    });

    socket.on('new_inNeed_notification', (newNotification) => {
      setNotifications(prev => [newNotification, ...prev]);
    });

    return () => {
      socket.off('new_inNeed_notification');
      socket.disconnect();
    };
  }, []);

 


  return (
    <div>
     

      {notifications.length === 0 ? (
        <p>No notifications yet.</p>
      ) : (
        <ul>
          {notifications.map(notif => (
            <li key={notif.id}>
              <strong>{new Date(notif.createdAt || notif.timestamp).toLocaleString()}:</strong> {notif.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminNotifications;


// import React from 'react';
// import { useNotification } from "@/contexts/notification-context";

// const AdminNotifications = () => {
//   const { notifications } = useNotification();

//   return (
//     <div>
//       {notifications.length === 0 ? (
//         <p>No notifications yet.</p>
//       ) : (
//         <ul>
//           {notifications.map((notif) => (
//             <li key={notif.id}>
//               <strong>{new Date(notif.createdAt || notif.timestamp).toLocaleString()}:</strong> {notif.message}
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// };

// export default AdminNotifications;
