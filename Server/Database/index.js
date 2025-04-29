const { Sequelize,DataTypes } = require('sequelize')

const sequelize = new Sequelize('donation', 'postgres', 'root', {
    host: 'localhost',
    dialect:'postgres'
  });



  const User = require('../models/user.model')(sequelize,DataTypes);

  const DonationItem = require('../models/donationItems')(sequelize,DataTypes);
  const Category = require('../models/category')(sequelize,DataTypes);

  const Payment = require('../models/payment.model')(sequelize,DataTypes);
  const report= require('../models/report.model')(sequelize,DataTypes);
  const favourite= require('../models/favourite.model')(sequelize,DataTypes);
const Notification= require('../models/notification.model')(sequelize,DataTypes);
const Comment= require('../models/comment.model')(sequelize,DataTypes);
const inNeed= require('../models/InNeed')(sequelize,DataTypes);

const campaignDonation = require('../models/CampaignDonations')(sequelize,DataTypes);
const Event = require('../models/Event')(sequelize,DataTypes);
const Message = require('../models/Message')(sequelize,DataTypes);

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

module.exports={User, Payment,report,favourite,Notification,Comment,inNeed,campaignDonation,Event,Message};

