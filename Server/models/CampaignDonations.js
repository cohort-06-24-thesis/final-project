module.exports = (sequelize, DataTypes) => {
    const CampaignDonations = sequelize.define('CampaignDonations', {
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        images: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: true
        },
        progress: {
            type: DataTypes.FLOAT,
            defaultValue: 0.0
        },
        goal: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        totalRaised: {
            type: DataTypes.FLOAT,
            defaultValue: 0.0
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: false
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: false
        },
        isApproved: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        status: {
            type: DataTypes.ENUM('active', 'completed'),
            allowNull: false,
            defaultValue: 'active'
        },
        UserId: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });
    return CampaignDonations;
};