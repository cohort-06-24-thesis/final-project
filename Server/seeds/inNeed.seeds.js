'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('InNeeds', [
      {
        title: 'Emergency Food Assistance',
        description: 'Family in need of immediate food assistance due to unexpected circumstances. Any help would be greatly appreciated.',
        images: ['https://example.com/food1.jpg', 'https://example.com/food2.jpg'],
        location: 'New York, NY',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Winter Clothing Drive',
        description: 'Collecting warm winter clothing for homeless individuals in our community. Looking for coats, boots, and warm accessories.',
        images: ['https://example.com/clothing1.jpg'],
        location: 'Chicago, IL',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Medical Supplies Needed',
        description: 'Urgent need for medical supplies for local clinic. Looking for basic first aid supplies and medications.',
        images: ['https://example.com/medical1.jpg', 'https://example.com/medical2.jpg'],
        location: 'Los Angeles, CA',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('InNeeds', null, {});
  }
}; 