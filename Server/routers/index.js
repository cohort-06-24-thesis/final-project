const express = require('express');
const donationItemsRouter = require('./donationItems.route');
const categoryRouter = require('./category.route');
const paymentRouter = require('./payment.router');
const favouriteRouter = require('./favourite.router');
const commentRouter = require('./comment.router');
const reportRouter = require('./report.router');
const notificationRouter = require('./notification.router');
const userRouter = require('./user.route');

const router = express.Router();

// // Mount routers
router.use('/donationItems', donationItemsRouter);
router.use('/category', categoryRouter);
router.use('/payment', paymentRouter);
router.use('/favourite', favouriteRouter);
router.use('/comment', commentRouter);
router.use('/report', reportRouter);
router.use('/notification', notificationRouter);
router.use('/users', userRouter);

module.exports = router;