// controllers/messageController.js

const { Message, Conversation } = require('../Database/index');
const { Op } = require('sequelize');

// Create a new message
exports.createMessage = async (req, res) => {
    try {
        const { text, isRead, roomId, senderId, receiverId } = req.body;
        
        // First, find or create a conversation
        let conversation = await Conversation.findOne({
            where: {
                members: {
                    [Op.contains]: [senderId, receiverId]
                }
            }
        });

        if (!conversation) {
            console.log('Creating new conversation for users:', senderId, receiverId);
            conversation = await Conversation.create({
                members: [senderId, receiverId],
                lastMessage: text,
                lastMessageTime: new Date()
            });
        } else {
            // Update last message
            await conversation.update({
                lastMessage: text,
                lastMessageTime: new Date()
            });
        }

        // Create the message with the conversation ID
        const newMessage = await Message.create({ 
            text, 
            isRead,
            roomId,
            senderId,
            receiverId,
            ConversationId: conversation.id
        });

        res.status(201).json(newMessage);
    } catch (error) {
        console.error('Error creating message:', error);
        res.status(500).json({ error: 'Something went wrong while creating the message.' });
    }
};

// Get all messages
exports.getAllMessages = async (req, res) => {
    try {
        const messages = await Message.findAll();
        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Something went wrong while fetching messages.' });
    }
};

// Get messages by room ID
exports.getMessagesByRoomId = async (req, res) => {
    try {
        const { roomId } = req.params;
        const messages = await Message.findAll({
            where: { roomId },
            order: [['createdAt', 'ASC']]
        });
        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching messages by room:', error);
        res.status(500).json({ error: 'Something went wrong while fetching room messages.' });
    }
};

// Get a single message by ID
exports.getMessageById = async (req, res) => {
    try {
        const { id } = req.params;
        const message = await Message.findByPk(id);

        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        res.status(200).json(message);
    } catch (error) {
        console.error('Error fetching message:', error);
        res.status(500).json({ error: 'Something went wrong while fetching the message.' });
    }
};

// Update a message by ID
exports.updateMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { text, isRead } = req.body;

        const message = await Message.findByPk(id);

        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        await message.update({ 
            text, 
            isRead 
        });

        res.status(200).json(message);
    } catch (error) {
        console.error('Error updating message:', error);
        res.status(500).json({ error: 'Something went wrong while updating the message.' });
    }
};

// Delete a message by ID
exports.deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const message = await Message.findByPk(id);

        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        await message.destroy();
        res.status(200).json({ message: 'Message deleted successfully.' });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ error: 'Something went wrong while deleting the message.' });
    }
}; 