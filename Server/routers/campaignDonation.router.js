// routes/campaignDonations.js

const express = require('express');
const router = express.Router();
const {add,getAllCampaigns,getCampaignById,updateCampaign,deleteCampaign} = require('../controllers/campaignDonation.controller.js');

router.post('/', add);
router.get('/', getAllCampaigns);
router.get('/:id', getCampaignById);
router.put('/:id', updateCampaign);
router.delete('/:id', deleteCampaign);

module.exports = router;
