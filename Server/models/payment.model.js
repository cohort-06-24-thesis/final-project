module.exports = (sequelize, DataTypes) => {
    const payment = sequelize.define('payment', {
     
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('pending', 'paid', 'failed'),
        defaultValue: 'pending',
        allowNull: false
      },
      transaction_id: {
        type: DataTypes.STRING,
        allowNull: true
      },
      payment_url: {
        type: DataTypes.STRING,
        allowNull: true
      }
    });
  
    return payment;
  }; 