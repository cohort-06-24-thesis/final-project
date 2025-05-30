const { Event } = require('../Database/index');

const events = [
  {
    title: 'Community Food Drive',
    description: 'Join us for a community-wide food collection drive to help local families in need.',

    images: ['https://www.willistonfoodshelf.com/uploads/1/3/4/3/134363529/vsecu-donation-boxes-at-branch_orig.jpg'],

    date: new Date('2025-12-17'),
    location: 'Tunis Central Community Center',
    latitude: 36.8065,
    longitude: 10.1815,
    status: 'upcoming',

    participators: 0,


    isApproved: false,


    UserId: 'Jks4PbEyKrX4H7QwNxIE9FDCxjz1'
  },
  {
    title: 'Children\'s Book Fair',
    description: 'Annual book fair collecting and distributing books to underprivileged children.',

    images: ['https://english.news.cn/20250427/0a3c9bf155254ab7b1ae4bd6568bf52c/202504270a3c9bf155254ab7b1ae4bd6568bf52c_202504270945b823282d4d7ab2ed6c244a4c7c44.jpg'],

    date: new Date('2025-07-01'),
    location: 'Sfax Public Library',
    latitude: 34.7478,
    longitude: 10.7662,
    status: 'upcoming',

    participators: 0,


    isApproved: true,


    UserId: 'uDVoIeFDpVWDWisqxM76uP5MHcs1'
  },
  {
    title: 'Medical Outreach Program',
    description: 'Free medical checkups and consultations for elderly residents.',

    images: ['https://www.providertech.com/wp-content/uploads/2018/12/AdobeStock_179244223-1080x675.jpeg'],

    date: new Date('2025-07-20'),
    location: 'Sousse Medical Center',
    latitude: 35.8245,
    longitude: 10.6346,
    status: 'upcoming',

    participators: 0,


    isApproved: true,


    UserId: 'uAsdlgTBGtatrpxhUAnw7Grnxj73'
  },
  {

    title: 'Beach Cleanup Initiative',
    description: 'Help us clean and preserve our beautiful coastline for future generations.',
    images: ['https://images.ctfassets.net/f7tuyt85vtoa/HlFT09bB1nX1KaBwf4iod/b3d38fd109a3b88def6d3eaf1d478de8/AFEMEA_Venturina_resized.JPG'],
    date: new Date('2025-06-10'),
    location: 'Hammamet Beach',
    latitude: 36.4000,
    longitude: 10.6167,
    status: 'upcoming',

    participators: 0,

    isApproved: true,


    UserId: 'NM0kL08MmZZD9X6HIPvKbHq2pTo1'
  },
  {
    title: 'Senior Tech Workshop',
    description: 'Teaching basic computer and smartphone skills to elderly community members.',
    images: ['https://nelowvision.com/wp-content/uploads/2024/10/group-of-seniors-attending-it-class-in-community-c-2024-10-18-09-41-10-utc.jpg'],
    date: new Date('2025-05-31'),
    location: 'Nabeul Community Center',
    latitude: 36.4561,
    longitude: 10.7376,
    status: 'upcoming',

    participators: 0,


    isApproved: true,


    UserId: 'Jks4PbEyKrX4H7QwNxIE9FDCxjz1'
  },
  {
    title: 'Youth Mentorship Program',
    description: 'Connect with and guide local youth through career and education choices.',
    images: ['https://www.phatkidsmentoring.org/resources/1481.jpg.opt558x313o0%2C0s558x313.jpg'],
    date: new Date('2025-07-01'),
    location: 'Mahdia Youth Center',
    latitude: 35.5047,
    longitude: 11.0622,
    status: 'upcoming',

    participators: 0,


    isApproved: true,


    UserId: 'uDVoIeFDpVWDWisqxM76uP5MHcs1'
  },
  {
    title: 'Animal Shelter Support Day',
    description: 'Help local animal shelters with cleaning, feeding, and animal care.',
    images: ['https://cdn.shopify.com/s/files/1/0310/8093/9564/files/Celebrate_Shelter_Pet_Day_480x480.jpg?v=1649707434'],
    date: new Date('2025-11-23'),
    location: 'Monastir Animal Shelter',
    latitude: 35.7770,
    longitude: 10.8261,
    status: 'upcoming',

    participators: 0,


    isApproved: true,


    UserId: 'uAsdlgTBGtatrpxhUAnw7Grnxj73'
  },
  {
    title: 'Community Garden Project',
    description: 'Create and maintain a sustainable community garden for local produce.',
    images: ['https://www.startts.org.au/media/Karen-Gardens-1200-x-700-5.jpg'],

    date: new Date('2025-08-05'),
    location: 'Kairouan Green Space',
    latitude: 35.6781,
    longitude: 10.0963,
    status: 'upcoming',

    participators: 0,


    isApproved: true,


    UserId: 'NM0kL08MmZZD9X6HIPvKbHq2pTo1'
  },
  {
    title: 'Coding Workshop for Kids',
    description: 'Introduce children to basic programming concepts through fun activities.',
    images: ['https://funtechsummercamps.com/blog/wp-content/uploads/2019/07/minecraft-coding-copy.jpg'],
    date: new Date('2025-06-05'),
    location: 'Bizerte Tech Hub',
    status: 'upcoming',
    latitude: 37.2793,
    longitude: 9.8740,    

    participators: 0,

    isApproved: true,


    UserId: 'Jks4PbEyKrX4H7QwNxIE9FDCxjz1'
  },
  {

    title: 'Arts and Crafts Fair',
    description: 'Showcase local artisans and support traditional craftsmanship.',
    images: ['https://static1.squarespace.com/static/5e71036b8bb60b55f6cf2873/t/6133d2250ed21f4e573067a6/1630786091068/craftfair.jpg'],
    date: new Date('2025-06-15'),
    location: 'Sidi Bou Said Cultural Center',
    latitude: 36.8361,
    longitude: 10.2923,

    status: 'upcoming',

    participators: 0,


    isApproved: true,


    UserId: 'uDVoIeFDpVWDWisqxM76uP5MHcs1'
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