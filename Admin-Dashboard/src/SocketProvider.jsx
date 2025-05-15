
import React from 'react';

function SocketProvider({ children }) {
  // No socket event listeners or emits here 
  return <>{children}</>;
}

export default SocketProvider;
