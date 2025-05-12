module.exports = (sequelize, DataTypes) => {
    const Report = sequelize.define('Report', {
        reason: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        userId: {
            type: DataTypes.STRING,  // Changed to STRING to match User model's id type
            allowNull: false
        },
        itemId: {
            type: DataTypes.INTEGER,  // This should be INTEGER if DonationItem uses SERIAL/INTEGER for id
            allowNull: true  // Making it nullable for now to avoid constraints issues
        },
        itemType: { // <--- Add this
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        timestamps: true
    });

    return Report;
};