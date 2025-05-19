const express = require('express');
const cors = require('cors');
const routers = require('./routers');
const http = require('http');
const socket = require('./socket'); 

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/api', routers);

// Create HTTP server
const server = http.createServer(app);

// ✅ Initialize Socket.IO
socket.init(server);

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});