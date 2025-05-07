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
    profilePic: 'https://scontent.ftun1-2.fna.fbcdn.net/v/t39.30808-6/480758183_2921751518001489_4935118845920783671_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=106&ccb=1-7&_nc_sid=833d8c&_nc_ohc=ekCSrd9uOhsQ7kNvwG5qJo0&_nc_oc=AdlZh8TsI38r7Dhctk5qpu5Y79q0Pi6t0aQnrHeHrdwx-t8aykp-8D5ymkavd2Sq8Td-y8zK0tn6HqKw5smhJdgS&_nc_zt=23&_nc_ht=scontent.ftun1-2.fna&_nc_gid=yNA7DAtOaGMbftGedA-9AQ&oh=00_AfL_3bvh1VmNHqa6oG9SFtFaWKIPz3URRbChz0D9HGccqQ&oe=681FF76F',
    email: 'rdamdoum@gmail.com',
    password: '112233',
    role: 'user',
    rating: 4.6,
  },
  {
    id: 'uAsdlgTBGtatrpxhUAnw7Grnxj73',
    name: 'benali mouin',
    profilePic: 'https://lh3.googleusercontent.com/a/ACg8ocLhWYNIEBXdGhaKIIM_LR838F5fzRZ4Ozsq0FoALVbO1wkpA9b8=s360-c-no',
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

