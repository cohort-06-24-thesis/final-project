const { User } = require('../Database/index');

const users = [
  {
    id: 'Jks4PbEyKrX4H7QwNxIE9FDCxjz1',
    name: 'Mohamed',
    profilePic: 'https://lh3.googleusercontent.com/a/ACg8ocIDWaj4C5_t0KMSUXsHlR-TCusICZoHB3pz7GsJ70N3B4VsFf0H=s288-c-no',
    email: 'medjemai4go@gmail.com',
    password: '123456',
    role: 'user',
    status:"active",
    rating: 4.6,
  },
  {
    id: 'uDVoIeFDpVWDWisqxM76uP5MHcs1',
    name: 'Rayen',
    profilePic: 'https://scontent.ftun10-2.fna.fbcdn.net/v/t39.30808-6/480758183_2921751518001489_4935118845920783671_n.jpg?stp=c0.169.1536.1536a_cp6_dst-jpg_s206x206_tt6&_nc_cat=106&ccb=1-7&_nc_sid=50ad20&_nc_ohc=PM2DSIT8zHoQ7kNvwFd6pS6&_nc_oc=AdloyQacx44euzXg3UQGNSOyCebruZV3FowB_VgOODZpq8MVnsddy5IJn3zp9fMw1CU&_nc_zt=23&_nc_ht=scontent.ftun10-2.fna&_nc_gid=M0Q_GgjKgptYy9SsCVIm3g&oh=00_AfJBbFsKb9ZXyjEryOwdSK6UytiNHYDVAu42F-9H5ePmOg&oe=6828C16F',
    email: 'rdamdoum@gmail.com',
    password: '112233',
    role: 'user',
    status:"active",
    rating: 4.6,
  },
  {
    id: 'uAsdlgTBGtatrpxhUAnw7Grnxj73',
    name: 'benali mouin',
    profilePic: 'https://lh3.googleusercontent.com/a/ACg8ocLhWYNIEBXdGhaKIIM_LR838F5fzRZ4Ozsq0FoALVbO1wkpA9b8=s360-c-no',
    email: 'benalimouin@gmail.com',
    password: '12346789',
    role: 'user',
    status:"active",
    rating: 4.5,
  },
  {
    id: 'NM0kL08MmZZD9X6HIPvKbHq2pTo1',
    name: 'nassira',
    email: 'garanassira@gmail.com',
    password: '123456',
    role: 'user',
    status:"active",
    rating: 4.5,
  }
];

const seedUsers = async () => {
  try {
    await User.destroy({ where: {} });
    await User.bulkCreate(users);
    console.log('Users seeded successfully');
  } catch (error) {
    console.error('Error seeding users:', error);
  }
};

module.exports = seedUsers;

