// controllers/messageController.js

const { Message } = require('../Database/index');

// Create a new message
exports.createMessage = async (req, res) => {
    try {
        const { text, isRead, roomId, senderId, receiverId } = req.body;
        const newMessage = await Message.create({ 
            text, 
            isRead,
            roomId,
            senderId,
            receiverId
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