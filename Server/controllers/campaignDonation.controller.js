


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


// Update a Campaign by ID
 updateCampaign : async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, images, goal, totalRaised, progress, startDate, endDate } = req.body;

        const campaign = await CampaignDonations.findByPk(id);

        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });

    ,
    getCampaignDonationById:async(req,res)=>{
        try {
            const { id } = req.params;
            const campaignDonationData = await campaignDonations.findByPk(id);
            if (!campaignDonationData) {
                return res.status(404).json({ message: "Campaign donation not found" });
            }
            res.status(200).json(campaignDonationData);
        } catch (error) {
            res.status(500).json({ message: "Error retrieving campaign donation", error });
        }
    },
 
    updateCampaignDonation:async(req,res)=>{
        try {
            const { id } = req.params;
            const { campaignId, userId, amount } = req.body;
            const campaignDonationData = await campaignDonations.findByPk(id);
            if (!campaignDonationData) {
                return res.status(404).json({ message: "Campaign donation not found" });
            }
            campaignDonationData.campaignId = campaignId;
            campaignDonationData.userId = userId;
            campaignDonationData.amount = amount;
            await campaignDonationData.save();
            res.status(200).json(campaignDonationData);
        } catch (error) {
            res.status(500).json({ message: "Error updating campaign donation", error });
        }
    },
    deleteCampaignDonation:async(req,res)=>{
        try {
            const { id } = req.params;
            const campaignDonationData = await campaignDonations.findByPk(id);
            if (!campaignDonationData) {
                return res.status(404).json({ message: "Campaign donation not found" });
            }
            await campaignDonationData.destroy();
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: "Error deleting campaign donation", error });

        }
    }

},


}