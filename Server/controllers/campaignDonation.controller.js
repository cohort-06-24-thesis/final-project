const { CampaignDonations } = require('../Database/index.js');

// Create a new Campaign
module.exports = {
  add: async (req, res) => {
    try {
      const { title, description, images, goal, startDate, endDate, UserId } = req.body;

      // Basic input validation
      if (!title || !description || !goal || !startDate || !endDate || !UserId) {
        return res.status(400).json({ error: 'Missing required fields' });
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