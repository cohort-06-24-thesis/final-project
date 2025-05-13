module.exports = (sequelize, DataTypes) => {
    const Report = sequelize.define('Report', {
        reason: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        userId: {
            type: DataTypes.STRING,  // The user who made the report
            allowNull: false
        },
        reportedUserId: {           // Add this new field
            type: DataTypes.STRING,  // The user being reported
            allowNull: true
        },
        itemId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        itemType: {
            type: DataTypes.STRING,
            allowNull: true,
        }
    }, {
        timestamps: true
    });

    Report.associate = (models) => {
        Report.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'reporter'
        });
        Report.belongsTo(models.User, {
            foreignKey: 'reportedUserId',
            as: 'reportedUser'
        });
    };

    return Report;
};