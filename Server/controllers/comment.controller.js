const db = require('../Database');
const Comment = db.Comment;
const User = db.User;

module.exports = {
    // Create a new comment
    createComment: async (data) => {
        const { content, userId, inNeedId } = data;

        if (!content || !userId || !inNeedId) {
            throw new Error('Missing required fields');
        }

        const newComment = await Comment.create({
            content,
            userId,
            inNeedId
        });

        // Fetch complete comment with user data
        return Comment.findOne({
            where: { id: newComment.id },
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'profilePic']
            }],
            raw: true,
            nest: true
        });
    },

    // Get all comments
    findAllComments: async (inNeedId) => {
        if (!inNeedId) {
            throw new Error('inNeedId is required');
        }

        return Comment.findAll({
            where: { inNeedId },
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'profilePic']
            }],
            order: [['createdAt', 'DESC']],
            raw: true,
            nest: true
        });
    },

    // Get a single comment by id
    findOne: async (req, res) => {
        try {
            const comment = await Comment.findByPk(req.params.id);
            if (comment) {
                res.status(200).json(comment);
            } else {
                res.status(404).json({
                    message: `Comment with id=${req.params.id} not found.`
                });
            }
        } catch (error) {
            res.status(500).json({
                message: error.message || "Error retrieving comment."
            });
        }
    },

    // Update a comment
    updateComment: async (req, res) => {
        try {
            const { id } = req.params;
            const { content } = req.body;

            const comment = await Comment.findByPk(id);
            if (!comment) {
                return res.status(404).json({
                    success: false,
                    message: 'Comment not found'
                });
            }

            await comment.update({ content });

            const updatedComment = await Comment.findOne({
                where: { id },
                include: [{
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'profilePic']
                }]
            });

            res.status(200).json({
                success: true,
                message: 'Comment updated successfully',
                comment: updatedComment
            });

        } catch (error) {
            console.error('Error updating comment:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating comment',
                error: error.message
            });
        }
    },

    // Delete a comment
    deleteComment: async (req, res) => {
        try {
            const { id } = req.params;
            
            const comment = await Comment.findByPk(id);
            if (!comment) {
                return res.status(404).json({
                    success: false,
                    message: 'Comment not found'
                });
            }

            await comment.destroy();
            
            res.status(200).json({
                success: true,
                message: 'Comment deleted successfully'
            });

        } catch (error) {
            console.error('Error deleting comment:', error);
            res.status(500).json({
                success: false,
                message: 'Error deleting comment',
                error: error.message
            });
        }
    }
};