const express = require('express');
const cors = require('cors');
const routers = require('./routers');
const http = require('http');
const socket = require('./socket'); 
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api', routers);

// Create HTTP server
const server = http.createServer(app);

// ✅ Initialize Socket.IO
socket.init(server);

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});