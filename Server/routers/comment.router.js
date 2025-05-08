const router = require('express').Router();
const commentController = require('../controllers/comment.controller');

// Create a new comment
router.post('/createComment', async (req, res) => {
    try {
        const comment = await commentController.createComment(req.body);
        res.status(201).json(comment);
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error creating comment'
        });
    }
});

// Get all comments for an inNeed
router.get('/findAllComments', async (req, res) => {
    try {
        const comments = await commentController.findAllComments(req.query.inNeedId);
        res.status(200).json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching comments'
        });
    }
});

// Delete a comment
router.delete('/delete/:id', commentController.deleteComment);

// Update a comment
router.put('/update/:id', commentController.updateComment);

module.exports = router;