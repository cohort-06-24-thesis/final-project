const {Comment} = require("../Database/index.js")

module.exports = {
    // Create a new comment
    create: async (req, res) => {
        try {
            const comment = await Comment.create({
                content: req.body.content
            });
            res.status(201).json(comment);
        } catch (error) {
            res.status(500).json({
                message: error.message || "Some error occurred while creating the comment."
            });
        }
    },

    // Get all comments
    findAll: async (req, res) => {
        try {
            const comments = await Comment.findAll();
            res.status(200).json(comments);
        } catch (error) {
            res.status(500).json({
                message: error.message || "Some error occurred while retrieving comments."
            });
        }
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
    update: async (req, res) => {
        try {
            const updated = await Comment.update({
                content: req.body.content
            }, {
                where: { id: req.params.id }
            });

            if (updated[0] === 1) {
                res.status(200).json({
                    message: "Comment was updated successfully."
                });
            } else {
                res.status(404).json({
                    message: `Cannot update comment with id=${req.params.id}. Comment not found.`
                });
            }
        } catch (error) {
            res.status(500).json({
                message: error.message || "Error updating comment."
            });
        }
    },

    // Delete a comment
 remove: async (req, res) => {
        try {
            const deleted = await Comment.destroy({
                where: { id: req.params.id }
            });

            if (deleted === 1) {
                res.status(200).json({
                    message: "Comment was deleted successfully!"
                });
            } else {
                res.status(404).json({
                    message: `Cannot delete comment with id=${req.params.id}. Comment not found.`
                });
            }
        } catch (error) {
            res.status(500).json({
                message: error.message || "Error deleting comment."
            });
        }
    }
};