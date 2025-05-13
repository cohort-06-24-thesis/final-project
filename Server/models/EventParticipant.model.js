module.exports = (sequelize, DataTypes) => {
    const EventParticipant = sequelize.define("EventParticipant", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        eventId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        userId: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });
    return EventParticipant;
};