module.exports = (sequelize, DataTypes) => {
    const Report = sequelize.define('Report', {
        reason: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        userId: {
            type: DataTypes.STRING,  
            allowNull: false
        },
        reportedUserId: {           
            type: DataTypes.STRING,  
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