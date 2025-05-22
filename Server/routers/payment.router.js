const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');

router.post('/create-intent', paymentController.createPaymentIntent);
router.get('/verify/:paymentId', paymentController.verifyPayment);
router.get('/all', paymentController.getAllPayments);

module.exports = router;