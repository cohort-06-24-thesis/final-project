// controllers/messageController.js

const { Message, Conversation, User, Notification } = require('../Database/index');
const { Op } = require('sequelize');
const { getIO } = require('../socket');

// Create a new message
exports.createMessage = async (req, res) => {
    try {
        const { text, isRead, roomId, senderId, receiverId } = req.body;
        console.log('Creating message:', { text, roomId, senderId, receiverId });
        
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
            console.log('Found existing conversation:', conversation.id);
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
            ConversationId: conversation.id,
            timestamp: new Date()
        });

        console.log('Created new message:', newMessage.id);

        // --- Notification logic ---
        // Get sender's name
        const sender = await User.findByPk(senderId);
        const senderName = sender ? sender.name : 'Someone';
        const notifMessage = `New message from ${senderName}: "${text}"`;

        // Create notification in DB
        const notification = await Notification.create({
            message: notifMessage,
            isRead: false,
            UserId: receiverId,
            itemId: newMessage.id,
            itemType: 'chat',
        });

        // Emit notification to receiver's room
        const io = getIO();
        io.to(`user_${receiverId}`).emit('new_notification', {
            ...notification.dataValues,
            timestamp: new Date().toISOString(),
        });

        // Also emit the message to the room
        io.to(roomId).emit('receive_message', {
            ...newMessage.dataValues,
            timestamp: new Date().toISOString(),
        });

        console.log('Message created and notifications sent successfully');
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
        console.log('Fetching messages for room:', roomId);

        const messages = await Message.findAll({
            where: { roomId },
            order: [['timestamp', 'ASC']]
        });

        console.log('Found', messages.length, 'messages for room', roomId);
        console.log('Message IDs:', messages.map(m => m.id));

        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching messages by room:', error);
        res.status(500).json({ error: 'Something went wrong while fetching messages.' });
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