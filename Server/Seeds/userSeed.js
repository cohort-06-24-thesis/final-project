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
    profilePic: 'https://scontent.ftun1-2.fna.fbcdn.net/v/t39.30808-6/465277796_2816211331888842_8251383577222584991_n.jpg?stp=cp6_dst-jpg_p526x296_tt6&_nc_cat=111&ccb=1-7&_nc_sid=833d8c&_nc_ohc=-JFK6TVcRkkQ7kNvwEHWSkJ&_nc_oc=AdkLAdKVYefWVlb4JcpeEW0sRYVcMnTUypu5DLg77hKeziAAShARvsBZyjNS3hNUmcU&_nc_zt=23&_nc_ht=scontent.ftun1-2.fna&_nc_gid=R6w4AzP4f5cHEjYO3hrBvA&oh=00_AfLRuFc343otbkdrzLGsq_ULvOySe41hi3mm371sYIbK6Q&oe=6838FF4C',
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

