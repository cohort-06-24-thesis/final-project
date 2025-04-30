const express = require('express');
const donationItemsRouter = require('./donationItems.route');
const categoryRouter = require('./category.route');
const paymentRouter = require('./payment.router');
const favouriteRouter = require('./favourite.router');
const commentRouter = require('./comment.router');
const reportRouter = require('./report.router');
const notificationRouter = require('./notification.router');
const inNeedRouter = require('./inNeed.router');
const campaignDonationRouter = require('./campaignDonation.router');
const eventRouter = require('./event.router');
const messageRouter = require('./message.router');
const conversationRouter = require('./conversation.router');
const userRouter = require('./user.route');


const router = express.Router();
router.use('/donationItems', donationItemsRouter);
router.use('/category', categoryRouter);
router.use('/payment', paymentRouter);
router.use('/favourite', favouriteRouter);
router.use('/comment', commentRouter);
router.use('/report', reportRouter);
router.use('/notification', notificationRouter);
router.use('/inNeed', inNeedRouter);
router.use('/campaignDonation', campaignDonationRouter);
router.use('/event', eventRouter);
router.use('/message', messageRouter);
router.use('/conversation', conversationRouter);
router.use('/user', userRouter);

module.exports = router;