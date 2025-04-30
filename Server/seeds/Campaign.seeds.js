'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('CampaignDonations', [
      {
        title: 'School Supplies for Underprivileged Children',
        description: 'Raising funds to provide school supplies for children in need.',
        images: ['https://example.com/school1.jpg', 'https://example.com/school2.jpg'],
        goal: 5000.00,
        totalRaised: 1500.00,
        progress: 30.0,
        startDate: new Date('2023-11-01'),
        endDate: new Date('2023-12-01'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Clean Water Initiative',
        description: 'Help us build wells to provide clean water to remote villages.',
        images: ['https://example.com/water1.jpg'],
        goal: 10000.00,
        totalRaised: 4000.00,
        progress: 40.0,
        startDate: new Date('2023-11-15'),
        endDate: new Date('2023-12-15'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Winter Shelter for the Homeless',
        description: 'Providing warm shelter and meals for the homeless during winter.',
        images: ['https://example.com/shelter1.jpg', 'https://example.com/shelter2.jpg'],
        goal: 8000.00,
        totalRaised: 2000.00,
        progress: 25.0,
        startDate: new Date('2023-12-01'),
        endDate: new Date('2024-01-01'),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('CampaignDonations', null, {});
  }
};