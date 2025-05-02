const { Category } = require('../Database/index');

const categories = [
  { name: 'Furniture' },
  { name: 'Home' },
  { name: 'Garden' },
  { name: 'DIY' },
  { name: 'Appliances' },
  { name: 'Electronics' },
  { name: 'Fashion' },
  { name: 'Beauty' },
  { name: 'Leisure' },
  { name: 'Childcare' },
  { name: 'Sports' },
  { name: 'Pets' },
];

const seedCategories = async () => {
  try {
    await Category.bulkCreate(categories);
    console.log('Categories seeded successfully');
  } catch (error) {
    console.error('Error seeding categories:', error);
  }
};

module.exports = seedCategories;