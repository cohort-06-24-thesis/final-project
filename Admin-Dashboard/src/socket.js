

import { io } from 'socket.io-client';

const SOCKET_SERVER_URL = 'http://localhost:3000';

const socket = io(SOCKET_SERVER_URL, {
  transports: ['websocket'],
  reconnectionAttempts: 5,
  timeout: 10000,
});

export default socket;