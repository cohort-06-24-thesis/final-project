module.exports = (sequelize, DataTypes) => {
    const Favourite = sequelize.define("Favourite", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        donationItemId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        inNeedId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        eventId: {  // Add this field
            type: DataTypes.INTEGER,
            allowNull: true
        }
    });

    return Favourite;
};