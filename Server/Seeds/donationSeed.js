const { DonationItem } = require('../Database/index');

const seedDonationItems = async () => {
  try {
    const donationItems = [
      {
        title: 'Winter Clothes',
        description: 'Warm clothes for children in need.',
        image: ['https://www.veteransplaceusa.org/wp-content/uploads/2019/12/Clothes-Donation-1024x683.jpg'],
        status: 'available',
        location: 'Tunis',
      },
      {
        title: 'School Supplies',
        description: 'Notebooks, pens, and other school essentials.',
        image: ['https://example.com/images/school-supplies.jpg'],
        status: 'reserved',
        location: 'Sfax',
      },
      {
        title: 'Food Packages',
        description: 'Non-perishable food items for families.',
        image: ['https://example.com/images/food-packages.jpg'],
        status: 'claimed',
        location: 'Sousse',
      },
    ];

    await DonationItem.bulkCreate(donationItems);
    console.log('Donation items seeded successfully.');
  } catch (error) {
    console.error('Error seeding donation items:', error);
  }
};

module.exports = seedDonationItems;