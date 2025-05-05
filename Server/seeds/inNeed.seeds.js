const { inNeed } = require('../Database/index');

const inNeedSeeds = [
  {
    title: 'Family Needs Assistance',
    description: 'Single mother with three children needs support with basic necessities.',
    images: ['https://www.shutterstock.com/shutterstock/photos/2014505123/display_1500/stock-photo-single-parent-family-with-three-children-sitting-on-tree-stumpand-leaning-on-mother-mom-playing-2014505123.jpg'],
    location: 'Tunis',
    latitude: 36.8065,
    longitude: 10.1815
  },
  {
    title: 'Medical Support Required',
    description: 'Elderly person needs assistance with medical supplies and regular checkups.',
    images: ['https://www.moneytalksnews.com/workers/images/width=730/wp-content/uploads/2018/03/30125529/shutterstock_371623984.jpg?s=9d0e1f868aa4bce2fbaff2ef7542190588362c27801ce53478cfcb5b8c887f15'],
    location: 'Sfax',
    latitude: 34.7405,
    longitude: 10.7603
  },
  {
    title: 'Education Support',
    description: 'Student from low-income family needs help with school supplies and tuition.',
    images: ['https://www.moneytalksnews.com/workers/images/width=730/wp-content/uploads/2018/03/30125529/shutterstock_371623984.jpg?s=9d0e1f868aa4bce2fbaff2ef7542190588362c27801ce53478cfcb5b8c887f15'],
    location: 'Sousse',
    latitude: 35.8256,
    longitude: 10.6368
  },
  {
    title: 'Housing Assistance',
    description: 'Family of five seeking temporary housing support after displacement.',
    images: ['https://missioneurasia.org/wp-content/uploads/2023/08/Family-in-front-of-destroyed-home-1-1.jpg'],
    location: 'Bizerte',
    latitude: 37.2707,
    longitude: 9.8739
  },
  {
    title: 'Food Support',
    description: 'Elderly couple needs regular food assistance and basic groceries.',
    images: ['https://www.moneytalksnews.com/workers/images/width=730/wp-content/uploads/2018/03/30125529/shutterstock_371623984.jpg?s=9d0e1f868aa4bce2fbaff2ef7542190588362c27801ce53478cfcb5b8c887f15'],
    location: 'Kairouan',
    latitude: 35.6782,
    longitude: 10.1012
  },
  {
    title: 'Disability Support',
    description: 'Person with disability needs assistance with mobility equipment.',
    images: ['https://www.timotion.com/_upload/images/Banni%C3%A8re_Disabled_W800xH420.jpg?v='],
    location: 'Gabes',
    latitude: 33.8839,
    longitude: 10.0959
  },
  {
    title: 'Winter Clothing Need',
    description: 'Family needs warm clothes and blankets for the winter season.',
    images: ['https://imageio.forbes.com/specials-images/imageserve/659822e9083be8c7a99187a1/A-family-holds-boxes-of-warm-winter-clothes-and-blankets-distributed-by-UNICEF-/960x0.jpg?format=jpg&width=1440'],
    location: 'Monastir',
    latitude: 35.7624,
    longitude: 10.8312
  },
  {
    title: 'Job Training Request',
    description: 'Young adult seeking support for vocational training program.',
    images: ['https://studentassembly.org/wp-content/uploads/2023/02/images4045-63efdd7969b1d.jpg'],
    location: 'Nabeul',
    latitude: 36.4575,
    longitude: 10.7382
  }
];

const seedInNeed = async () => {
  try {
    await inNeed.bulkCreate(inNeedSeeds);
    console.log('InNeed seeds executed successfully');
  } catch (error) {
    console.error('Error seeding InNeed data:', error);
    throw error;
  }
};

module.exports = seedInNeed;