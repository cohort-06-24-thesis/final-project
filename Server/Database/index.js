const { Sequelize,DataTypes } = require('sequelize')

const sequelize = new Sequelize('donation', 'postgres', 'root', {
    host: 'localhost',
    dialect:'postgres'
  });



  const User = require('../models/user.model')(sequelize,DataTypes);
  const DonationItem = require('../models/donationItems')(sequelize,DataTypes);
  const Category = require('../models/category')(sequelize,DataTypes);

  try {
   sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
// const connection=async()=>{
//   await sequelize.sync({ force: true });
// console.log('All models were synchronized successfully.');
// }
// connection()

module.exports={User,DonationItem,Category}
