const { inNeed } = require('../Database/index');

const inNeedSeeds = [
  {
    title: 'Family Needs Assistance',
    description: 'Single mother with three children needs support with basic necessities.',
    images: ['https://www.shutterstock.com/shutterstock/photos/2014505123/display_1500/stock-photo-single-parent-family-with-three-children-sitting-on-tree-stumpand-leaning-on-mother-mom-playing-2014505123.jpg'],
    location: 'Tunis'
  },
  {
    title: 'Medical Support Required',
    description: 'Elderly person needs assistance with medical supplies and regular checkups.',
    images: ['https://example.com/medical-support.jpg'],
    location: 'Sfax'
  },
  {
    title: 'Education Support',
    description: 'Student from low-income family needs help with school supplies and tuition.',
    images: ['https://example.com/education-support.jpg'],
    location: 'Sousse'
  },
  {
    title: 'Housing Assistance',
    description: 'Family of five seeking temporary housing support after displacement.',
    images: ['https://example.com/housing-support.jpg'],
    location: 'Bizerte'
  },
  {
    title: 'Food Support',
    description: 'Elderly couple needs regular food assistance and basic groceries.',
    images: ['https://example.com/food-support.jpg'],
    location: 'Kairouan'
  },
  {
    title: 'Disability Support',
    description: 'Person with disability needs assistance with mobility equipment.',
    images: ['https://example.com/disability-support.jpg'],
    location: 'Gabes'
  },
  {
    title: 'Winter Clothing Need',
    description: 'Family needs warm clothes and blankets for the winter season.',
    images: ['https://example.com/winter-support.jpg'],
    location: 'Monastir'
  },
  {
    title: 'Job Training Request',
    description: 'Young adult seeking support for vocational training program.',
    images: ['https://example.com/training-support.jpg'],
    location: 'Nabeul'
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