const express = require('express');
const router = express.Router();
const teamSupportController = require('../controllers/teamSupport.controller');

// Create a new team support donation
router.post('/', teamSupportController.createTeamSupport);

// Get all team support donations
router.get('/all', teamSupportController.getAllTeamSupports);

// Get team support donations for a specific user
router.get('/user', teamSupportController.getUserTeamSupports);

// Get total team support amount
router.get('/total', teamSupportController.getTotalTeamSupport);

// Get team support statistics
router.get('/stats', teamSupportController.getTeamSupportStats);

module.exports = router; 