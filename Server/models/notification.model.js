module.exports = (sequelize, DataTypes) => {
    const notification = sequelize.define('notification', {
        message: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        isRead: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        }
    });
  
    return notification;
};