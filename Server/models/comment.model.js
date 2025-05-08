module.exports = (sequelize, DataTypes) => {
    const Comment = sequelize.define('Comment', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        userId: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        inNeedId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'InNeeds',
                key: 'id'
            }
        }
    }, {
        timestamps: true
    });

    Comment.associate = (models) => {
        Comment.belongsTo(models.User, { 
            foreignKey: 'userId',
            as: 'user'
        });
        Comment.belongsTo(models.InNeed, { 
            foreignKey: 'inNeedId',
            as: 'inNeed'
        });
    };

    return Comment;
};