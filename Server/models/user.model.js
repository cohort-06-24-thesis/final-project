module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false 
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        profilePic: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        role: {
            type: DataTypes.STRING,
            defaultValue: 'user',
            validate: {
                isIn: [['admin', 'user']]
            }
        },
        rating: {
            type: DataTypes.FLOAT,
            defaultValue: 0.0
        },
       
    });
    return User;
}