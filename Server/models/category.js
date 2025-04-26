module.exports = (sequelize, DataTypes) => {
    const ItemsCategory = sequelize.define('ItemsCategory', {
        name: {
        type: DataTypes.STRING,
        allowNull: false,
        }
   });
    return ItemsCategory;
    }