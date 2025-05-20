const { CampaignDonations, User, Notification } = require('../Database/index.js');
const { getIO } = require('../socket');

// Create a new Campaign
module.exports = {
  add: async (req, res) => {
    try {
      const { title, description, images, goal, startDate, endDate, UserId } = req.body;

      // Basic input validation
      if (!title || !description || !goal || !startDate || !endDate || !UserId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Fetch the user who created the campaign
      const user = await User.findByPk(UserId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const newCampaign = await CampaignDonations.create({
        title,
        description,
        images,
        goal,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isApproved: false,
        status:'active',
        UserId,
      });

      // Construct notification message
      const message = `New Campaign: "${title}" by ${user.name}`;

      // Create notification in DB
      const notification = await Notification.create({
        message,
        isRead: false,
        UserId,
        itemId: newCampaign.id,
        itemType: 'campaign'
      });

      // Emit notification to admin clients
      const io = getIO();
      io.to('admins').emit('new_campaign_notification', {
        ...notification.dataValues,
        campaign: newCampaign,
        timestamp: new Date().toISOString(),
      });

      res.status(201).json(newCampaign);
    } catch (error) {
      console.error('Error creating campaign:', error);
      res.status(500).json({ error: 'Failed to create campaign' });
    }
  },

  // Get all Campaigns
  getAllCampaigns: async (req, res) => {
    try {
      const campaigns = await CampaignDonations.findAll();
      res.status(200).json(campaigns);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      res.status(500).json({ error: 'Failed to fetch campaigns' });
    }
  },

  // Get a single Campaign by ID
  getCampaignById: async (req, res) => {
    try {
      const { id } = req.params;
      const campaign = await CampaignDonations.findByPk(id);

      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }

      res.status(200).json(campaign);
    } catch (error) {
      console.error('Error fetching campaign:', error);
      res.status(500).json({ error: 'Failed to fetch campaign' });
    }
  },

  // Update a Campaign by ID
  updateCampaign: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, images, goal, totalRaised, progress, startDate, endDate, isApproved } = req.body;

      const campaign = await CampaignDonations.findByPk(id);

      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }

      // Store the previous approval status
      const wasApproved = campaign.isApproved;

      // Update only provided fields
      const updatedData = {
        title: title || campaign.title,
        description: description || campaign.description,
        images: images || campaign.images,
        goal: goal || campaign.goal,
        totalRaised: totalRaised || campaign.totalRaised,
        progress: progress || campaign.progress,
        startDate: startDate ? new Date(startDate) : campaign.startDate,
        endDate: endDate ? new Date(endDate) : campaign.endDate,
        isApproved: typeof isApproved === 'boolean' ? isApproved : campaign.isApproved,
      };

      await campaign.update(updatedData);

      // Send notification if approval status changed to true
      if (isApproved === true && wasApproved !== true) {
        const userId = campaign.UserId;

        // Create notification in DB
        const notification = await Notification.create({
          message: `Your campaign "${campaign.title}" has been approved!`,
          isRead: false,
          UserId: userId,
          itemId: campaign.id,
          itemType: 'campaign'
        });

        // Emit real-time notification to the user
        const io = getIO();
        io.to(`user_${userId}`).emit('new_notification', {
          ...notification.dataValues,
          timestamp: new Date().toISOString()
        });
      }

      res.status(200).json(campaign);
    } catch (error) {
      console.error('Error updating campaign:', error);
      res.status(500).json({ error: 'Failed to update campaign' });
    }
  },

  // Delete a Campaign by ID
  deleteCampaign: async (req, res) => {
    try {
      const { id } = req.params;
      const campaign = await CampaignDonations.findByPk(id);

      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }

      await campaign.destroy();
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting campaign:', error);
      res.status(500).json({ error: 'Failed to delete campaign' });
    }
  },
};