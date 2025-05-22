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
    profilePic: 'https://scontent.ftun1-2.fna.fbcdn.net/v/t39.30808-6/465279498_2816212461888729_9188584637743149428_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=2y9zw91pdhwQ7kNvwFi2eNq&_nc_oc=AdnMuJizHO2k8uFuSaEh14_Djmz0DwkFUB0uc6HfALTkJ6id73ARObt9OyW9YU2J7ZtLzeGio-o_1_d7CYMFQwA9&_nc_zt=23&_nc_ht=scontent.ftun1-2.fna&_nc_gid=rlx_awnlWHpWBM9isO9tMQ&oh=00_AfLdu_sRfdA4BGnU1GYkDwyUK_uV5_pSfhxKgkUZTn_pDA&oe=68313BA1',
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
    name: 'nassira ',
    profilePic: 'https://media.discordapp.net/attachments/1293597035269718116/1374044951599517696/20250519_161551.jpg?ex=682df014&is=682c9e94&hm=0fc0edd77861656e345ea68a140c6a9e5eb897700898435f56a8ae4b10bc7c01&=&format=webp&width=591&height=789',
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

