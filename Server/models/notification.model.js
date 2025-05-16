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
    },
    UserId: {
      type: DataTypes.STRING,
      allowNull: true 
    },
    itemId: {
      type: DataTypes.INTEGER,
      allowNull: true 
    },
    itemType: {
      type: DataTypes.STRING,
      allowNull: true 
    }
  });

  return notification;
};