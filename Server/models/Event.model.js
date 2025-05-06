module.exports = (sequelize, DataTypes) => {
    const Event = sequelize.define('Event', {
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
        date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        location: {
            type: DataTypes.STRING,
            allowNull: false
        },
        status : {
            type: DataTypes.ENUM('upcoming', 'ongoing', 'completed'),
            defaultValue: 'upcoming'
        },
        participators : {
            type: DataTypes.STRING,
            allowNull: false
        },
        UserId: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });
    return Event;
};