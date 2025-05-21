require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Payment, CampaignDonations,User } = require('../Database/index.js');

const paymentController = {
  createPaymentIntent: async (req, res) => {
    try {
      const { amount, campaignId,userId } = req.body;

      const amountInCents = Math.round(amount * 100);

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

      const payment = await Payment.create({
        amount: amount.toFixed(2),
        transaction_id: paymentIntent.id,
        campaignId: campaignId,
        userId
      });

      const campaign = await CampaignDonations.findByPk(campaignId);
      if (campaign) {
        const newTotalRaised = parseFloat(campaign.totalRaised) + parseFloat(amount);
        const newProgress = (newTotalRaised / campaign.goal) * 100;

        await campaign.update({
          totalRaised: newTotalRaised,
          progress: newProgress
        });
      }

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

      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

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
  },

  // ✅  get all payments
  getAllPayments: async (req, res) => {
    try {
      const payments = await Payment.findAll({
        include: {
          model: CampaignDonations,
         
          attributes: ['title', 'goal', 'totalRaised']
        },
        order: [['createdAt', 'DESC']]
      });

      res.json(payments);
    } catch (error) {
      console.error('Error fetching payments:', error);
      res.status(500).json({
        error: 'Failed to fetch payments',
        message: error.message
      });
    }
  }
};

module.exports = paymentController;
