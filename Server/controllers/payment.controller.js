require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Payment, CampaignDonations, User, Notification } = require('../Database/index.js');
const { getIO } = require('../socket');

const paymentController = {
  createPaymentIntent: async (req, res) => {
    try {
      const { amount, campaignId, userId } = req.body;

      const amountInCents = Math.round(amount * 100);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'usd',
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          campaignId,
          userId
        }
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
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

      // Only proceed if payment was successful
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({
          error: 'Payment not successful',
          status: paymentIntent.status
        });
      }

      // Get campaign and user info from payment intent metadata
      const { campaignId, userId } = paymentIntent.metadata;
      const amount = (paymentIntent.amount / 100).toFixed(2);

      // Create payment record
      const payment = await Payment.create({
        amount: amount,
        transaction_id: paymentIntentId,
        campaignId: campaignId,
        userId: userId
      });

      const campaign = await CampaignDonations.findByPk(campaignId);
      const user = await User.findByPk(userId);

      if (campaign) {
        const newTotalRaised = parseFloat(campaign.totalRaised) + parseFloat(amount);
        const newProgress = (newTotalRaised / campaign.goal) * 100;

        await campaign.update({
          totalRaised: newTotalRaised,
          progress: newProgress
        });

        // Create notification for payment
        const notification = await Notification.create({
          message: `New payment of TND ${amount} received for campaign "${campaign.title}" from ${user.name}`,
          isRead: false,
          UserId: userId,
          itemId: payment.id,
          itemType: 'payment'
        });

        // Emit notification to admin clients
        const io = getIO();
        io.to('admins').emit('new_payment_notification', {
          ...notification.dataValues,
          payment,
          campaign,
          user,
          timestamp: new Date().toISOString()
        });
      }

      res.json({
        amount: amount,
        paymentId: payment.id,
        status: 'success'
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
