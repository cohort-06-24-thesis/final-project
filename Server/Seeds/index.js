const userSeed = require('./userSeed');
const donationSeed = require('./donationSeed');
const CompaignSeed = require('./Campaign.seeds');
const EventSeed = require('./seed-events');
const inNeedSeed = require('./inNeed.seeds');


const runSeeds = async () => {
  try {
    console.log('Seeding users...');
    await userSeed();
    console.log('Seeding donations...');
    await donationSeed();
    console.log('Seeding campaigns...');
    await CompaignSeed();
    console.log('Seeding events...');
    await EventSeed();
    console.log('Seeding inNeed...');
    await inNeedSeed();
    console.log('All seeds executed successfully.');
  } catch (error) {
    console.error('Error running seeds:', error);
  }
};

runSeeds();