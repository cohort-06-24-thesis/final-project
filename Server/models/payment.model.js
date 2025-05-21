module.exports = (sequelize, DataTypes) => {
  const payment = sequelize.define("payment", {
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    transaction_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  return payment;
};
