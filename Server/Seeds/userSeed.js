const { User } = require('../Database/index');

const seedUsers = async () => {
  try {
    // Clear existing users to avoid unique constraint errors
    await User.destroy({ where: {} });

    const users = [
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        role: 'user',
        rating: 4.5,
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        password: 'password456',
        role: 'user',
        rating: 5.0,
      },
      {
        name: 'Alice Johnson',
        email: 'alice.johnson@example.com',
        password: 'password789',
        role: 'user',
        rating: 3.8,
      },
      {
        name: 'Rayeen',
        email: 'rayeen@gmail.com',
        password: '1234567',
        role: 'user',
        rating: 4.2,
      }
    ];

    await User.bulkCreate(users);
    console.log('Users seeded successfully.');
  } catch (error) {
    console.error('Error seeding users:', error);
  }
};

module.exports = seedUsers;