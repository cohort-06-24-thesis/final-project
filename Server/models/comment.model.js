module.exports = (sequelize, DataTypes) => {
    const comment = sequelize.define('comment', {
        content : {
            type: DataTypes.TEXT,
            allowNull: false
        }
    });
    return comment;
}

