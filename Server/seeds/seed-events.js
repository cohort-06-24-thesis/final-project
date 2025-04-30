const { Event } = require('../Database/index');

const events = [
  {
    title: 'Community Food Drive',
    description: 'Join us for a community-wide food collection drive to help local families in need.',
    images: ['https://example.com/food-drive.jpg'],
    date: new Date('2024-04-15'),
    location: 'Tunis Central Community Center',
    status: 'upcoming',
    participators: '50 volunteers needed'
  },
  {
    title: 'Children\'s Book Fair',
    description: 'Annual book fair collecting and distributing books to underprivileged children.',
    images: ['https://example.com/book-fair.jpg'],
    date: new Date('2024-05-01'),
    location: 'Sfax Public Library',
    status: 'upcoming',
    participators: '30 volunteers needed'
  },
  {
    title: 'Medical Outreach Program',
    description: 'Free medical checkups and consultations for elderly residents.',
    images: ['https://example.com/medical-outreach.jpg'],
    date: new Date('2024-04-20'),
    location: 'Sousse Medical Center',
    status: 'upcoming',
    participators: '20 medical professionals needed'
  },
  {
    title: 'Youth Sports Day',
    description: 'Sports equipment collection and activities for youth centers.',
    images: ['https://example.com/sports-day.jpg'],
    date: new Date('2024-05-15'),
    location: 'Bizerte Sports Complex',
    status: 'upcoming',
    participators: '40 volunteers needed'
  },
  {
    title: 'Education Supply Drive',
    description: 'Collecting school supplies for the upcoming academic year.',
    images: ['https://example.com/education-drive.jpg'],
    date: new Date('2024-06-01'),
    location: 'Monastir Community Hall',
    status: 'upcoming',
    participators: '25 volunteers needed'
  }
];

const seedEvents = async () => {
  try {
    await Event.bulkCreate(events);
    console.log('Events seeded successfully');
  } catch (error) {
    console.error('Error seeding events:', error);
    throw error;
  }
};

module.exports = seedEvents;