require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Payment, CampaignDonations } = require('../Database/index.js');

const paymentController = {
  createPaymentIntent: async (req, res) => {
    try {
      const { amount, campaignId } = req.body;

      // Convert amount to cents for Stripe
      const amountInCents = Math.round(amount * 100);

      // Create PaymentIntent with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'usd',
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          campaignId
        }
      });

      // Save payment information to database
      const payment = await Payment.create({
        amount: amount.toFixed(2),
        transaction_id: paymentIntent.id,
        campaignId: campaignId
      });

      // Find the campaign and update its totalRaised and progress
      const campaign = await CampaignDonations.findByPk(campaignId);
      if (campaign) {
        const newTotalRaised = parseFloat(campaign.totalRaised) + parseFloat(amount);
        const newProgress = (newTotalRaised / campaign.goal) * 100;
        
        await campaign.update({
          totalRaised: newTotalRaised,
          progress: newProgress
        });
      }

      // Return client secret to frontend
      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentId: payment.id
      });

    } catch (error) {
      console.error('Error creating payment intent:', error);
      res.status(500).json({
        error: 'Failed to create payment intent',
        message: error.message
      });
    }
  },

  verifyPayment: async (req, res) => {
    try {
      const { paymentIntentId } = req.params;

      // Retrieve payment intent from Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      // Find payment in database
      const payment = await Payment.findOne({
        where: { transaction_id: paymentIntentId }
      });

      if (!payment) {
        return res.status(404).json({
          error: 'Payment not found'
        });
      }

      res.json({
        amount: payment.amount,
        paymentId: payment.id
      });

    } catch (error) {
      console.error('Payment verification error:', error);
      res.status(500).json({
        error: 'Failed to verify payment',
        message: error.message
      });
    }
  }
};

module.exports = paymentController;