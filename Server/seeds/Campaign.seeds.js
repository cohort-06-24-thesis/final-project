const { CampaignDonations } = require('../Database/index');

const campaigns = [
  {
    title: 'Emergency Medical Aid',
    description: 'Help provide urgent medical supplies to local hospitals.',
    images: ['https://example.com/medical-aid.jpg'],
    progress: 45.5,
    goal: 10000,
    totalRaised: 4550,
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-05-01')
  },
  {
    title: 'School Building Project',
    description: 'Support building a new school in rural Tunisia.',
    images: ['https://example.com/school-project.jpg'],
    progress: 75.0,
    goal: 50000,
    totalRaised: 37500,
    startDate: new Date('2024-03-15'),
    endDate: new Date('2024-06-15')
  },
  {
    title: 'Clean Water Initiative',
    description: 'Provide clean drinking water to communities in need.',
    images: ['https://example.com/water-project.jpg'],
    progress: 30.0,
    goal: 15000,
    totalRaised: 4500,
    startDate: new Date('2024-04-01'),
    endDate: new Date('2024-07-01')
  },
  {
    title: 'Food Bank Support',
    description: 'Help stock local food banks for families in need.',
    images: ['https://example.com/food-bank.jpg'],
    progress: 60.0,
    goal: 8000,
    totalRaised: 4800,
    startDate: new Date('2024-03-10'),
    endDate: new Date('2024-04-10')
  },
  {
    title: 'Orphanage Renovation',
    description: 'Renovate facilities at local orphanage.',
    images: ['https://example.com/orphanage.jpg'],
    progress: 25.0,
    goal: 20000,
    totalRaised: 5000,
    startDate: new Date('2024-05-01'),
    endDate: new Date('2024-08-01')
  }
];

const seedCampaigns = async () => {
  try {
    await CampaignDonations.bulkCreate(campaigns);
    console.log('Campaign seeds executed successfully');
  } catch (error) {
    console.error('Error seeding campaigns:', error);
    throw error;
  }
};

module.exports = seedCampaigns;