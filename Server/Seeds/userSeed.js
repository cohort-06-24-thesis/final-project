const { User } = require('../Database/index');

const users = [
  {
    id: 'Jks4PbEyKrX4H7QwNxIE9FDCxjz1',
    name: 'Mohamed',
    email: 'medjemai4go@gmail.com',
    password: '123456',
    role: 'user',
    rating: 2,
  },
  {
    id: 'uDVoIeFDpVWDWisqxM76uP5MHcs1',
    name: 'Rayen',
    email: 'rdamdoum@gmail.com',
    password: '112233',
    role: 'user',
    rating: 4.6,
  },
  {
    id: 'vEoeitHhNdTFv9kAlU0Q0zHie8D3',
    name: 'benali mouin',
    email: 'benalimouin@gmail.com',
    password: '12346789',
    role: 'user',
    rating: 4.5,
  },
  {
    id: 'uAsdlgTBGtatrpxhUAnw7Grnxj73',
    name: 'benali mouin',
    email: 'benalimouin@gmail.com',
    password: '12346789',
    role: 'user',
    rating: 4.5,
  },
  {
    id: 'NM0kL08MmZZD9X6HIPvKbHq2pTo1',
    name: 'nassira',
    email: 'garanassira@gmail.com',
    password: '123456',
    role: 'user',
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

