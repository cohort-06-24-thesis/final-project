const express = require('express');
const donationItemsRouter = require('./donationItems.route');

const router = express.Router();

// Mount routers
router.use('/donationItems', donationItemsRouter);

module.exports = router;