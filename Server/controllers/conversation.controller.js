const {Conversation}=require("../Database/index.js")

module.exports= {
    getAllConversations: async (req, res) => {
        try {
            const conversations = await Conversation.find({ members: { $in: [req.user.id] } });
            res.status(200).json(conversations);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
,
    getConversation: async (req, res) => {
        try {
            const conversation = await Conversation.findById(req.params.id);
            if (!conversation) {
                return res.status(404).json({ message: 'Conversation not found' });
            }
            res.status(200).json(conversation);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
,
    createConversation: async (req, res) => {
        const { senderId, receiverId } = req.body;
        try {
            const newConversation = new Conversation({
                members: [senderId, receiverId],
            });
            await newConversation.save();
            res.status(201).json(newConversation);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
,
    deleteConversation: async (req, res) => {
        try {
            const conversation = await Conversation.findByIdAndDelete(req.params.id);
            if (!conversation) {
                return res.status(404).json({ message: 'Conversation not found' });
            }
            res.status(200).json({ message: 'Conversation deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
,
    updateConversation: async (req, res) => {
        try {
            const conversation = await Conversation.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!conversation) {
                return res.status(404).json({ message: 'Conversation not found' });
            }  
            res.status(200).json(conversation);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }   
    },
    getConversationsByUserId: async (req, res) => {
        try {
            const conversations = await Conversation.find({ members: { $in: [req.params.userId] } });
            res.status(200).json(conversations);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    getConversationByUserIds: async (req, res) => {
        try {
            const { userId, otherUserId } = req.params;
            const conversation = await Conversation.findOne({
                members: { $all: [userId, otherUserId] },
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
                members: { $all: [userId, otherUserId] },
            });
            if (!conversation) {
                return res.status(404).json({ message: 'Conversation not found' });
            }
            const messages = await Message.find({ conversationId: conversation._id });
            res.status(200).json(messages);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
,
    getConversationById: async (req, res) => {
        try {
            const conversation = await Conversation.findById(req.params.id);
            if (!conversation) {
                return res.status(404).json({ message: 'Conversation not found' });
            }
            res.status(200).json(conversation);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    
}
