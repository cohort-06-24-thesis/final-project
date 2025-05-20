module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    roomId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    senderId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    receiverId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    ConversationId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'conversations',
        key: 'id'
      }
    }
  });
  return Message;
};