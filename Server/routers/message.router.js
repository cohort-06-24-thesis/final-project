// routes/message.router.js

const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const upload = require('../middleware/upload');

// Create a new message
router.post('/', messageController.createMessage);

// Upload image message
router.post('/upload', upload.array('images', 10), messageController.uploadImage);

// Get all messages
router.get('/', messageController.getAllMessages);

// Get messages by room ID
router.get('/room/:roomId', messageController.getMessagesByRoomId);

// Get a single message by ID
router.get('/:id', messageController.getMessageById);

// Update a message by ID
router.put('/:id', messageController.updateMessage);

// Delete a message by ID
router.delete('/:id', messageController.deleteMessage);

module.exports = router; 