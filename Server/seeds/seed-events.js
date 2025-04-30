const { sequelize } = require('../Database/index');
const { Event } = require('../Database/index');  // Import Event model directly

const events = [
  {
    title: 'Ramadhan Donations',
    description: 'Help provide iftar meals for families in need during the holy month',
    images: ['https://www.palaisfaraj.com/wp-content/uploads/2025/02/luxury-hotel-fez-morocco-blog-ftor-ramadan-morocco-2025.jpg'],
    date: new Date('2025-03-10'),
    location: 'Tunis',
    status: 'upcoming',
    partcipators: 'TunisHelp, Red Crescent'
  },
  {
    title: 'Eid al-Fitr Support',
    description: 'Support families with essential supplies for Eid celebrations',
    images: ['https://thearabweekly.com/sites/default/files/styles/article_image_800x450_/public/2024-04/2024-04-09_07-53-30_066216.jpg?itok=I2Q7L66l'],
    date: new Date('2025-04-15'),
    location: 'Ariana',
    status: 'upcoming',
    partcipators: 'Youth Aid Org, Volunteers A'
  },
  {
    title: 'Back-to-School Drive',
    description: 'Provide school kits for underprivileged children',
    images: ['https://example.com/school.jpg'],
    date: new Date('2025-08-25'),
    location: 'Sfax',
    status: 'upcoming',
    partcipators: 'Education First, TunisDonors'
  },
  {
    title: 'Winter Clothes Drive',
    description: 'Distribute coats and blankets to the homeless',
    images: ['https://example.com/winter.jpg'],
    date: new Date('2025-11-01'),
    location: 'Kairouan',
    status: 'upcoming',
    partcipators: 'Warm Hearts NGO'
  },
  {
    title: 'Food Basket Campaign',
    description: 'Deliver food packages to low-income households',
    images: ['https://example.com/food.jpg'],
    date: new Date('2025-05-05'),
    location: 'Sousse',
    status: 'upcoming',
    partcipators: 'FoodForAll Org'
  },
  {
    title: 'Clean Water Initiative',
    description: 'Build wells in rural areas to ensure clean water access',
    images: ['https://example.com/water.jpg'],
    date: new Date('2025-06-12'),
    location: 'Gafsa',
    status: 'upcoming',
    partcipators: 'AquaLife Foundation'
  },
  {
    title: 'Health Checkup Camp',
    description: 'Free health screenings and consultations for all ages',
    images: ['https://example.com/health.jpg'],
    date: new Date('2025-07-10'),
    location: 'Bizerte',
    status: 'upcoming',
    partcipators: 'HealthFirst Tunisia'
  },
  {
    title: 'Orphanage Support Program',
    description: 'Collect donations for orphanage upkeep and supplies',
    images: ['https://example.com/orphan.jpg'],
    date: new Date('2025-09-20'),
    location: 'Gabès',
    status: 'upcoming',
    partcipators: 'HopeHouse Foundation'
  },
  {
    title: 'Women Empowerment Workshop',
    description: 'Train and support women in local communities',
    images: ['https://example.com/women.jpg'],
    date: new Date('2025-10-10'),
    location: 'Tozeur',
    status: 'upcoming',
    partcipators: 'Rise Women Org'
  },
  {
    title: 'Disability Aid Drive',
    description: 'Provide wheelchairs and equipment for the disabled',
    images: ['https://example.com/disability.jpg'],
    date: new Date('2025-12-05'),
    location: 'Mahdia',
    status: 'upcoming',
    partcipators: 'Accessibility Now'
  },
  // Add 10 more events below (duplicates with different cities or slight tweaks)
  {
    title: 'Ramadhan Food Packs',
    description: 'Support fasting families with food essentials',
    images: ['https://example.com/ramadhan2.jpg'],
    date: new Date('2025-03-12'),
    location: 'Zarzis',
    status: 'upcoming',
    partcipators: 'HopeGivers'
  },
  {
    title: 'Children’s Book Drive',
    description: 'Distribute books to rural schools',
    images: ['https://example.com/books.jpg'],
    date: new Date('2025-07-19'),
    location: 'Tataouine',
    status: 'upcoming',
    partcipators: 'Readers Club'
  },
  {
    title: 'Senior Citizen Support',
    description: 'Aid elderly citizens with daily supplies',
    images: ['https://example.com/seniors.jpg'],
    date: new Date('2025-08-30'),
    location: 'Monastir',
    status: 'upcoming',
    partcipators: 'Golden Years Org'
  },
  {
    title: 'Environmental Awareness Week',
    description: 'Plant trees and clean public parks',
    images: ['https://example.com/eco.jpg'],
    date: new Date('2025-06-05'),
    location: 'El Kef',
    status: 'upcoming',
    partcipators: 'Green Tunisia'
  },
  {
    title: 'Animal Shelter Aid',
    description: 'Provide food and medicine for rescued animals',
    images: ['https://example.com/animals.jpg'],
    date: new Date('2025-11-15'),
    location: 'Nabeul',
    status: 'upcoming',
    partcipators: 'Paws & Hope'
  },
  {
    title: 'Village Lighting Project',
    description: 'Install solar lights in underserved areas',
    images: ['https://example.com/solar.jpg'],
    date: new Date('2025-09-12'),
    location: 'Beja',
    status: 'upcoming',
    partcipators: 'Light The Way'
  },
  {
    title: 'Refugee Aid Program',
    description: 'Collect goods for displaced families',
    images: ['https://example.com/refugee.jpg'],
    date: new Date('2025-10-20'),
    location: 'Medenine',
    status: 'upcoming',
    partcipators: 'Safe Haven'
  },
  {
    title: 'Mental Health Awareness Day',
    description: 'Workshops and resources for emotional support',
    images: ['https://example.com/mental.jpg'],
    date: new Date('2025-10-30'),
    location: 'Jendouba',
    status: 'upcoming',
    partcipators: 'MindMatters TN'
  },
  {
    title: 'Emergency Relief Kit Distribution',
    description: 'Be prepared: donate to assemble emergency packs',
    images: ['https://example.com/relief.jpg'],
    date: new Date('2025-04-01'),
    location: 'Siliana',
    status: 'upcoming',
    partcipators: 'Rapid Relief Org'
  },
  {
    title: 'Community Kitchen Launch',
    description: 'Open a permanent kitchen to serve daily meals',
    images: ['https://example.com/kitchen.jpg'],
    date: new Date('2025-05-20'),
    location: 'Manouba',
    status: 'upcoming',
    partcipators: 'FoodBridge'
  }
];

const seedEvents = async () => {
  try {
    // Remove db.sequelize.sync() since we're using the initialized sequelize instance
    await Event.bulkCreate(events);
    console.log(`✅ Seeded ${events.length} events successfully.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to seed events:', error);
    process.exit(1);
  }
};

// Only run if this file is being run directly
if (require.main === module) {
  seedEvents();
}

module.exports = seedEvents;