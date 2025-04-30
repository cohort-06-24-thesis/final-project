const express = require('express');
const router = express.Router();
const {add, getAllCampaigns, getCampaignById, updateCampaign, deleteCampaignDonation} = require('../controllers/campaignDonation.controller.js');

// Create new campaign
router.post('/', add);

// Get all campaigns
router.get('/', getAllCampaigns);

// Get campaign by ID
router.get('/:id', getCampaignById);

// Update campaign
router.put('/:id', updateCampaign);

// Delete campaign
router.delete('/:id', deleteCampaignDonation); // Make sure deleteCampaign is properly exported from the controller

module.exports = router;