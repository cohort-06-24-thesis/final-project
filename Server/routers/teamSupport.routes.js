const express = require('express');
const router = express.Router();
const teamSupportController = require('../controllers/teamSupport.controller');

// Create a new team support donation
router.post('/', teamSupportController.createTeamSupport);

// Get all team support donations (admin only)
router.get('/', teamSupportController.getAllTeamSupports);

// Get team support donations for a specific user
router.get('/user/:userUID', teamSupportController.getUserTeamSupports);

// Get total amount of team support donations
router.get('/total', teamSupportController.getTotalTeamSupport);

// Get team support statistics
router.get('/stats', teamSupportController.getTeamSupportStats);

module.exports = router; 