const express = require('express');
const donationItemsRouter = require('./donationItems.route');
const categoryRouter = require('./category.route');

const router = express.Router();

// Mount routers
router.use('/donationItems', donationItemsRouter);
router.use('/category', categoryRouter);

module.exports = router;