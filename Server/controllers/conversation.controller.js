const { Conversation, User, Message } = require("../Database/index.js");
const { Op } = require("sequelize");

module.exports = {
    getAllConversations: async (req, res) => {
        try {
            const conversations = await Conversation.findAll({
                include: [{
                    model: User,
                    attributes: ['id', 'name', 'email', 'profilePic']
                }]
            });
            res.status(200).json(conversations);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getConversationsByUserId: async (req, res) => {
        try {
            const { userId } = req.params;
            console.log('Fetching conversations for user:', userId);
            
            // First get all conversations
            const allConversations = await Conversation.findAll();
            console.log('All conversations in database:', JSON.stringify(allConversations, null, 2));
            
            // Then filter in JavaScript
            const userConversations = allConversations.filter(conv => {
                try {
                    console.log('Checking conversation:', conv.id, 'Members:', conv.members);
                    const members = Array.isArray(conv.members) ? conv.members : JSON.parse(conv.members);
                    const includes = members.includes(userId);
                    console.log('Does conversation include user?', includes);
                    return includes;
                } catch (e) {
                    console.error('Error parsing members for conversation', conv.id, ':', e);
                    return false;
                }
            });
            
            console.log('Found conversations for user:', JSON.stringify(userConversations, null, 2));
            res.status(200).json(userConversations);
        } catch (error) {
            console.error('Error in getConversationsByUserId:', error);
            res.status(500).json({ message: error.message });
        }
    },

    createConversation: async (req, res) => {
        try {
            const { senderId, receiverId } = req.body;
            console.log('Creating conversation between:', senderId, 'and', receiverId);
            
            const allConvs = await Conversation.findAll();
            console.log('Existing conversations:', allConvs);
            
            const existingConversation = allConvs.find(conv => {
                const members = Array.isArray(conv.members) ? conv.members : JSON.parse(conv.members);
                return members.includes(senderId) && members.includes(receiverId) && members.length === 2;
            });
            
            if (existingConversation) {
                console.log('Found existing conversation:', existingConversation);
                return res.status(200).json(existingConversation);
            }
            
            const newConversation = await Conversation.create({
                members: [senderId, receiverId]
            });
            console.log('Created new conversation:', newConversation);
            res.status(201).json(newConversation);
        } catch (error) {
            console.error('Create conversation error:', error);
            res.status(500).json({ message: error.message });
        }
    },

    getConversation: async (req, res) => {
        try {
            const conversation = await Conversation.findByPk(req.params.id, {
                include: [{
                    model: User,
                    attributes: ['id', 'name', 'email', 'profilePic']
                }]
            });
            if (!conversation) {
                return res.status(404).json({ message: 'Conversation not found' });
            }
            res.status(200).json(conversation);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    deleteConversation: async (req, res) => {
        try {
            const conversation = await Conversation.destroy({
                where: { id: req.params.id }
            });
            if (!conversation) {
                return res.status(404).json({ message: 'Conversation not found' });
            }
            res.status(200).json({ message: 'Conversation deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    updateConversation: async (req, res) => {
        try {
            const conversation = await Conversation.update(req.body, {
                where: { id: req.params.id },
                returning: true
            });
            if (!conversation[0]) {
                return res.status(404).json({ message: 'Conversation not found' });
            }
            res.status(200).json(conversation[1][0]);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getConversationByUserIds: async (req, res) => {
        try {
            const { userId, otherUserId } = req.params;
            const conversation = await Conversation.findOne({
                include: [{
                    model: User,
                    attributes: ['id', 'name', 'email', 'profilePic']
                }],
                where: {
                    [Op.and]: [
                        { '$Users.id$': userId },
                        { '$Users.id$': otherUserId }
                    ]
                }
            });
            if (!conversation) {
                return res.status(404).json({ message: 'Conversation not found' });
            }
            res.status(200).json(conversation);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getMessagesByUserIds: async (req, res) => {
        try {
            const { userId, otherUserId } = req.params;
            const conversation = await Conversation.findOne({
                include: [{
                    model: User,
                    attributes: ['id', 'name', 'email', 'profilePic']
                }],
                where: {
                    [Op.and]: [
                        { '$Users.id$': userId },
                        { '$Users.id$': otherUserId }
                    ]
                }
            });
            if (!conversation) {
                return res.status(404).json({ message: 'Conversation not found' });
            }
            const messages = await Message.findAll({
                where: { conversationId: conversation.id }
            });
            res.status(200).json(messages);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getConversationById: async (req, res) => {
        try {
            const conversation = await Conversation.findByPk(req.params.id, {
                include: [{
                    model: User,
                    attributes: ['id', 'name', 'email', 'profilePic']
                }]
            });
            if (!conversation) {
                return res.status(404).json({ message: 'Conversation not found' });
            }
            res.status(200).json(conversation);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};
