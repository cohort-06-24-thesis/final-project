// controllers/campaignDonationsController.js

const { CampaignDonations } = require('../Database/index.js');

// Create a new Campaign
module.exports = {
    add : async (req, res) => {
    try {
        const { title, description, images, goal, startDate, endDate } = req.body;
        const newCampaign = await CampaignDonations.create({
            title,
            description,
            images,
            goal,
            startDate: new Date(startDate),
            endDate: new Date(endDate)
        });
        res.status(201).json(newCampaign);
    } catch (error) {
        console.error('Error creating campaign:', error);
        // res.status(500).json({ error: 'Something went wrong while creating the campaign.' });
        res.send(error)
    }
},

// Get all Campaigns
getAllCampaigns : async (req, res) => {
    try {
        const campaigns = await CampaignDonations.findAll();
        res.status(200).json(campaigns);
    } catch (error) {
        console.error('Error fetching campaigns:', error);
        // res.status(500).json({ error: 'Something went wrong while fetching campaigns.' });
        res.send(error)
    }
},

// Get a single Campaign by ID
 getCampaignById : async (req, res) => {
    try {
        const { id } = req.params;
        const campaign = await CampaignDonations.findByPk(id);

        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        res.status(200).json(campaign);
    } catch (error) {
        console.error('Error fetching campaign:', error);
        res.status(500).json({ error: 'Something went wrong while fetching the campaign.' });
    }
},

// Update a Campaign by ID
 updateCampaign : async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, images, goal, totalRaised, progress, startDate, endDate } = req.body;

        const campaign = await CampaignDonations.findByPk(id);

        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        await campaign.update({
            title,
            description,
            images,
            goal,
            totalRaised,
            progress,
            startDate,
            endDate
        });

        res.status(200).json(campaign);
    } catch (error) {
        console.error('Error updating campaign:', error);
        res.status(500).json({ error: 'Something went wrong while updating the campaign.' });
    }
},

// Delete a Campaign by ID
 deleteCampaign : async (req, res) => {
    try {
        const { id } = req.params;
        const campaign = await CampaignDonations.findByPk(id);

        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        await campaign.destroy();
        res.status(200).json({ message: 'Campaign deleted successfully.' });
    } catch (error) {
        console.error('Error deleting campaign:', error);
        res.status(500).json({ error: 'Something went wrong while deleting the campaign.' });
    }
}
}