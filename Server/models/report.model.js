module.exports = (sequelize, DataTypes) => {
    const Report = sequelize.define('Report', {
        reason: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    }, {
        timestamps: true
    });

    return Report;
};