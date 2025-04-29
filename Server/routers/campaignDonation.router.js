// routes/campaignDonations.js

const express = require('express');
const router = express.Router();
const campaignDonationsController = require('../controllers/campaignDonation.controller');

router.post('/', campaignDonationsController.createCampaign);
router.get('/', campaignDonationsController.getAllCampaigns);
router.get('/:id', campaignDonationsController.getCampaignById);
router.put('/:id', campaignDonationsController.updateCampaign);
router.delete('/:id', campaignDonationsController.deleteCampaign);

module.exports = router;
