const express= require('express');
const router= express.Router();
const conversationController= require('../controllers/conversation.controller');

router.post('/create', conversationController.createConversation); // Create a new conversation
router.get('/getAll', conversationController.getAllConversations); // Get all conversations
router.get('/:id', conversationController.getConversationById); // Get a conversation by ID
router.put('/:id', conversationController.updateConversation); // Update a conversation by ID
router.delete('/:id', conversationController.deleteConversation); // Delete a conversation by ID
router.get('/user/:userId', conversationController.getConversationsByUserId); // Get conversations by user ID
router.get('/user/:userId/other/:otherUserId', conversationController.getConversationByUserIds); // Get a conversation between two users
router.get('/user/:userId/other/:otherUserId/messages', conversationController.getMessagesByUserIds); // Get messages between two users

module.exports = router;