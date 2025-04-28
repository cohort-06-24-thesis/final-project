module.exports = (sequelize, DataTypes) => {
    const Message = sequelize.define('Message', {
       content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        timestamp: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        
        isRead : {
            type : DataTypes.BOOLEAN,
            defaultValue: DataTypes.BOOLEAN
        }
    });
    return Message;
};