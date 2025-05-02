const { Sequelize,DataTypes } = require('sequelize')

const sequelize = new Sequelize('donation', 'postgres', 'root', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false, // Disable logging
  define: {
      timestamps: true
  }
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


const CampaignDonations = require('../models/CampaignDonations')(sequelize,DataTypes);
const Event = require('../models/Event.model')(sequelize,DataTypes);

const Message = require('../models/Message')(sequelize,DataTypes);
const Conversation = require('../models/Conversation.model')(sequelize,DataTypes);


User.hasMany(DonationItem, { foreignKey: 'userId' });
DonationItem.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(favourite, { foreignKey: 'userId' });
favourite.belongsTo(User, { foreignKey: 'userId' });

DonationItem.hasMany(favourite, { foreignKey: 'donationItemId' });
favourite.belongsTo(DonationItem, { foreignKey: 'donationItemId' });

Category.hasMany(DonationItem, { foreignKey: 'categoryId' });
DonationItem.belongsTo(Category, { foreignKey: 'categoryId' });

User.hasMany(report, { foreignKey: 'userId' });
report.belongsTo(User, { foreignKey: 'userId' });


User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Comment, { foreignKey: 'userId' });
Comment.belongsTo(User, { foreignKey: 'userId' });

DonationItem.hasMany(Comment, { foreignKey: 'donationItemId' });
Comment.belongsTo(DonationItem, { foreignKey: 'donationItemId' });

User.hasMany(inNeed, { foreignKey: 'userId' });
inNeed.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(CampaignDonations, { foreignKey: 'userId' });
CampaignDonations.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Event, { foreignKey: 'userId' });
Event.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Message, { foreignKey: 'senderId' });
Message.belongsTo(User, { foreignKey: 'senderId' });

Conversation.hasMany(Message, { foreignKey: 'ConversationId' });
Message.belongsTo(Conversation, { foreignKey: 'ConversationId' });

User.belongsToMany(Conversation, { through: 'UserConversations', foreignKey: 'userId' });
Conversation.belongsToMany(User, { through: 'UserConversations', foreignKey: 'ConversationId' });

CampaignDonations.hasMany(Payment, { foreignKey: 'campaignId' });
Payment.belongsTo(CampaignDonations, { foreignKey: 'campaignId' });

Event.hasMany(DonationItem, { foreignKey: 'eventId' });
DonationItem.belongsTo(Event, { foreignKey: 'eventId' });

Category.hasMany(DonationItem , { foreignKey: 'categoryId' });
DonationItem.belongsTo(Category , { foreignKey: 'categoryId' });


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



module.exports={User, Payment,report,DonationItem,Category,favourite,Notification,Comment,inNeed,CampaignDonations,Event,Message,Conversation};


