const { TeamSupport, User, Payment } = require('../Database');
const { Op } = require('sequelize');

// Create a new team support donation
const createTeamSupport = async (req, res) => {
    try {
        const { amount, message, userUID, transaction_id } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid donation amount' });
        }

        // Find user by UID
        const user = await User.findOne({ where: { id: userUID } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create team support record
        const teamSupport = await TeamSupport.create({
            amount,
            message,
            UserId: user.id,
            transaction_id
        });

        res.status(201).json({
            message: 'Team support donation created successfully',
            data: {
                teamSupport
            }
        });
    } catch (error) {
        console.error('Error creating team support:', error);
        res.status(500).json({ message: 'Error creating team support donation' });
    }
};

// Get all team support donations (admin only)
const getAllTeamSupports = async (req, res) => {
    try {
        const teamSupports = await TeamSupport.findAll({
            include: [
                {
                    model: User,
                    as: 'supporter',
                    attributes: ['id', 'name', 'email', 'profilePic']
                },
                {
                    model: Payment,
                    as: 'payment',
                    attributes: ['id', 'amount', 'status', 'transaction_id']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            message: 'Team support donations retrieved successfully',
            data: teamSupports
        });
    } catch (error) {
        console.error('Error retrieving team supports:', error);
        res.status(500).json({ message: 'Error retrieving team support donations' });
    }
};

// Get team support donations for a specific user
const getUserTeamSupports = async (req, res) => {
    try {
        const { userUID } = req.params;

        const user = await User.findOne({ where: { id: userUID } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const teamSupports = await TeamSupport.findAll({
            where: { UserId: user.id },
            include: [
                {
                    model: Payment,
                    as: 'payment',
                    attributes: ['id', 'amount', 'status', 'transaction_id']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            message: 'User team support donations retrieved successfully',
            data: teamSupports
        });
    } catch (error) {
        console.error('Error retrieving user team supports:', error);
        res.status(500).json({ message: 'Error retrieving user team support donations' });
    }
};

// Get total amount of team support donations
const getTotalTeamSupport = async (req, res) => {
    try {
        const total = await TeamSupport.sum('amount', {
            include: [{
                model: Payment,
                as: 'payment',
                where: {
                    status: 'paid'
                }
            }]
        });

        res.status(200).json({
            message: 'Total team support amount retrieved successfully',
            data: {
                total: total || 0
            }
        });
    } catch (error) {
        console.error('Error calculating total team support:', error);
        res.status(500).json({ message: 'Error calculating total team support amount' });
    }
};

// Update team support payment
const updateTeamSupportPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { transaction_id } = req.body;

        const teamSupport = await TeamSupport.findByPk(id);
        if (!teamSupport) {
            return res.status(404).json({ message: 'Team support donation not found' });
        }

        // Update payment with transaction ID
        const payment = await Payment.findByPk(teamSupport.paymentId);
        if (!payment) {
            return res.status(400).json({ message: 'Payment record not found' });
        }

        await payment.update({
            transaction_id,
            status: 'paid'
        });

        res.status(200).json({
            message: 'Team support payment updated successfully',
            data: teamSupport
        });
    } catch (error) {
        console.error('Error updating team support payment:', error);
        res.status(500).json({ message: 'Error updating team support payment' });
    }
};

// Get team support statistics
const getTeamSupportStats = async (req, res) => {
    try {
        const totalDonations = await TeamSupport.count({
            include: [{
                model: Payment,
                as: 'payment',
                where: {
                    status: 'paid'
                }
            }]
        });
        
        const totalAmount = await TeamSupport.sum('amount', {
            include: [{
                model: Payment,
                as: 'payment',
                where: {
                    status: 'paid'
                }
            }]
        });
        
        const averageAmount = totalAmount / totalDonations || 0;

        res.status(200).json({
            message: 'Team support statistics retrieved successfully',
            data: {
                totalDonations,
                totalAmount: totalAmount || 0,
                averageAmount
            }
        });
    } catch (error) {
        console.error('Error retrieving team support statistics:', error);
        res.status(500).json({ message: 'Error retrieving team support statistics' });
    }
};

module.exports = {
    createTeamSupport,
    getAllTeamSupports,
    getUserTeamSupports,
    getTotalTeamSupport,
    updateTeamSupportPayment,
    getTeamSupportStats
}; 