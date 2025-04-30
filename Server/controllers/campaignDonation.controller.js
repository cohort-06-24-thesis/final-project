const {campaignDonation}=require("../Database/index.js")

module.exports={
    getAllCampaignDonation:async(req,res)=>{
        try {
            const campaignDonationData = await campaignDonation.findAll();
            res.status(200).json(campaignDonationData);
        } catch (error) {
            res.status(500).json({ message: "Error retrieving campaign donations", error });
        }
    }
    ,
    getCampaignDonationById:async(req,res)=>{
        try {
            const { id } = req.params;
            const campaignDonationData = await campaignDonation.findByPk(id);
            if (!campaignDonationData) {
                return res.status(404).json({ message: "Campaign donation not found" });
            }
            res.status(200).json(campaignDonationData);
        } catch (error) {
            res.status(500).json({ message: "Error retrieving campaign donation", error });
        }
    },
    createCampaignDonation:async(req,res)=>{
        try {
            const { campaignId, userId, amount } = req.body;
            const newCampaignDonation = await campaignDonation.create({
                campaignId,
                userId,
                amount
            });
            res.status(201).json(newCampaignDonation);
        } catch (error) {
            res.status(500).json({ message: "Error creating campaign donation", error });
        }
    },
    updateCampaignDonation:async(req,res)=>{
        try {
            const { id } = req.params;
            const { campaignId, userId, amount } = req.body;
            const campaignDonationData = await campaignDonation.findByPk(id);
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
            const campaignDonationData = await campaignDonation.findByPk(id);
            if (!campaignDonationData) {
                return res.status(404).json({ message: "Campaign donation not found" });
            }
            await campaignDonationData.destroy();
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: "Error deleting campaign donation", error });
        }
    }


    

}