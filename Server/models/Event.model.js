module.exports = (sequelize, DataTypes) => {
    const Event = sequelize.define("Event", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        location: {
            type: DataTypes.STRING,
            allowNull: false
        },
        latitude: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 36.8065
        },
        longitude: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 10.1815
        },
        images: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            defaultValue: []
        },
        participators: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'upcoming'
        },
        isApproved: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        UserId: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });
    return Event;
};