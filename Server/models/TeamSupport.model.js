module.exports = (sequelize, DataTypes) => {
    const TeamSupport = sequelize.define('TeamSupport', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        transaction_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        UserId: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        }
    });

    TeamSupport.associate = (models) => {
        TeamSupport.belongsTo(models.User, {
            foreignKey: 'UserId',
            as: 'supporter'
        });
    };

    return TeamSupport;
}; 