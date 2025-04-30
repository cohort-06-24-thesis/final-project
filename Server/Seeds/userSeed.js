const { User } = require('../Database/index');

const seedUsers = async () => {
  try {
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
        role: 'admin',
        rating: 5.0,
      },
      {
        name: 'Alice Johnson',
        email: 'alice.johnson@example.com',
        password: 'password789',
        role: 'user',
        rating: 3.8,
      },
    ];

    await User.bulkCreate(users);
    console.log('Users seeded successfully.');
  } catch (error) {
    console.error('Error seeding users:', error);
  }
};

module.exports = seedUsers;