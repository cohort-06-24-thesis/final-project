module.exports=(sequelize, DataTypes) => {
    const User= sequelize.define('User', {

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
            type: DataTypes.STRING,
            allowNull: true
        },
        role:{
            type:DataTypes.ENUM('admin','user'),
            defaultValue:'user'
        },
        rating:{
            type:DataTypes.FLOAT,
            defaultValue:0.0
        },
    })
    return User
}