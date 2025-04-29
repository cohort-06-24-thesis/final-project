const express = require('express');
const {
    createInNeed,
    getAllInNeeds,
    getInNeedById,
    updateInNeed,
    deleteInNeed
} = require('../controllers/inNeed.controller');

const router = express.Router();

// Define routes for InNeed
router.post('/create', createInNeed); // Create a new InNeed
router.get('/all', getAllInNeeds); // Get all InNeed entries
router.get('/:id', getInNeedById); // Get a single InNeed by ID
router.put('/:id', updateInNeed); // Update an InNeed by ID
router.delete('/:id', deleteInNeed); // Delete an InNeed by ID

module.exports = router;