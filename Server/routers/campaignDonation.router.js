// routes/campaignDonations.js

const express = require('express');
const router = express.Router();
const campaignDonationsController = require('../controllers/campaignDonation.controller');

router.get('/getAll', campaignDonationsController.getAllCampaignDonation);
router.get('/:id', campaignDonationsController.getCampaignDonationById);
router.post('/add', campaignDonationsController.createCampaignDonation);
router.put('/:id', campaignDonationsController.updateCampaignDonation);
router.delete('/:id', campaignDonationsController.deleteCampaignDonation);
    

module.exports = router;
