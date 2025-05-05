const { Event } = require('../Database/index');

const events = [
  {
    title: 'Community Food Drive',
    description: 'Join us for a community-wide food collection drive to help local families in need.',
    images: ['https://www.tampabay.com/resizer/v2/volunteer-alfred-delio-packs-boxes-of-XBCJCAMBBTJJLYFTNQOAFPIG3Q.jpg?auth=30cda10948a89d2f4e62c226582c0ca9e7d2c30921f0a08ebfdc972597723f1f&height=506&width=900&smart=true'],
    date: new Date('2024-04-15'),
    location: 'Tunis Central Community Center',
    status: 'upcoming',
    participators: '50 volunteers needed'
  },
  {
    title: 'Children\'s Book Fair',
    description: 'Annual book fair collecting and distributing books to underprivileged children.',
    images: ['https://whyy.org/wp-content/uploads/2021/01/2020-02-01-n-piserchio-spring-garden-philadelphia-pa-childrens-african-american-bookfair-5.jpg'],
    date: new Date('2024-05-01'),
    location: 'Sfax Public Library',
    status: 'upcoming',
    participators: '30 volunteers needed'
  },
  {
    title: 'Medical Outreach Program',
    description: 'Free medical checkups and consultations for elderly residents.',
    images: ['https://www.vcom.edu/sites/default/files/styles/medium_4x3/public/2020-03/AARP%20Health%20Fair.jpg?h=fab29234&itok=RVPsrCg3'],
    date: new Date('2024-04-20'),
    location: 'Sousse Medical Center',
    status: 'upcoming',
    participators: '20 medical professionals needed'
  },
  {
    title: 'Youth Sports Day',
    description: 'Sports equipment collection and activities for youth centers.',
    images: ['https://media.licdn.com/dms/image/v2/D5612AQHb4OXiTAUJrA/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1702179121573?e=2147483647&v=beta&t=TqcBE30s3tBrrn58u78iWRKhL9QuIW7FqTwmcwi5ga8'],
    date: new Date('2024-05-15'),
    location: 'Bizerte Sports Complex',
    status: 'upcoming',
    participators: '40 volunteers needed'
  },
  {
    title: 'Education Supply Drive',
    description: 'Collecting school supplies for the upcoming academic year.',
    images: ['https://images.cutimes.com/contrib/content/uploads/sites/413/2019/09/Democracy-Federal-Credit-Union-e1568303128145.jpg'],
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