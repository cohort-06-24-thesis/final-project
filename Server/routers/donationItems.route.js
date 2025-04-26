const express = require('express');
const router = express.Router();
const donationItemsController = require('../controllers/donationItems.controller');

// Routes for donation items
router.post('/', donationItemsController.createDonationItem);
router.get('/', donationItemsController.getAllDonationItems);
router.get('/:id', donationItemsController.getDonationItemById);
router.put('/:id', donationItemsController.updateDonationItem);
router.delete('/:id', donationItemsController.deleteDonationItem);
router.patch('/:id/reserve', donationItemsController.reserveDonationItem);
router.patch('/:id/claim', donationItemsController.claimDonationItem);
router.get('/status/available', donationItemsController.getAvailableDonationItems);
router.get('/status/reserved', donationItemsController.getReservedDonationItems);
router.get('/status/claimed', donationItemsController.getClaimedDonationItems);
router.get('/location/:location', donationItemsController.getDonationItemsByLocation);
router.get('/status/:status', donationItemsController.getDonationItemsByStatus);
router.get('/title/:title', donationItemsController.getDonationItemsByTitle);

module.exports = router;