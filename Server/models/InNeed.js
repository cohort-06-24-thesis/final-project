module.exports = (sequelize, DataTypes) => {
    const InNeed = sequelize.define('InNeed', {
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
        location: {
            type: DataTypes.STRING,
            allowNull: false
        },
        latitude: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        longitude: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        UserId: {
            type: DataTypes.STRING,
            allowNull: false,
          }
        
    });
    return InNeed;
};