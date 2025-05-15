import React, { useEffect } from 'react';
import socket from './socket'; // your socket.js client
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function SocketProvider({ children }) {
  useEffect(() => {
    socket.emit('join_admin_dashboard');

    socket.on('new_inNeed_notification', (data) => {
      toast.info(data.message || 'New notification!');
    });

    return () => {
      socket.off('new_inNeed_notification');
    };
  }, []);

  return (
    <>
      {children}
      <ToastContainer position="top-right" />
    </>
  );
}

export default SocketProvider;
