const userSeed = require('./userSeed');
const donationSeed = require('./donationSeed');

const runSeeds = async () => {
  try {
    console.log('Seeding users...');
    await userSeed();
    console.log('Seeding donations...');
    await donationSeed();
    console.log('All seeds executed successfully.');
  } catch (error) {
    console.error('Error running seeds:', error);
  }
};

runSeeds();