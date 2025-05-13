const { CampaignDonations } = require('../Database/index');

const campaigns = [
  {
    title: 'Emergency Medical Aid',
    description: 'Help provide urgent medical supplies to local hospitals.',
    images: ['https://netec.org/wp-content/uploads/2021/12/MM52201-18JK-F0488-850x567.jpg'],
    progress: 45.5,
    goal: 10000,
    totalRaised: 4550,
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-05-01'),
    isApproved: false, 
    status:'active',
    UserId: 'Jks4PbEyKrX4H7QwNxIE9FDCxjz1'
  },
  {
    title: 'School Building Project',
    description: 'Support building a new school in rural Tunisia.',
    images: ['https://www.levelset.com/wp-content/uploads/2022/01/SchoolConstructionCost-768x384.png'],
    progress: 75.0,
    goal: 50000,
    totalRaised: 37500,
    startDate: new Date('2024-03-15'),
    endDate: new Date('2024-06-15'),
    isApproved: false, 
    status:'active',

    UserId: 'uDVoIeFDpVWDWisqxM76uP5MHcs1'
  },
  {
    title: 'Clean Water Initiative',
    description: 'Provide clean drinking water to communities in need.',
    images: ['https://dacfoundation.org/frontend/db-assets/cause-images/1700368682-noticias_thebighand_5-1120x550.jpg'],
    progress: 30.0,
    goal: 15000,
    totalRaised: 4500,
    startDate: new Date('2024-04-01'),
    endDate: new Date('2024-07-01'),
    isApproved: true, 
    status:'active',


    UserId: 'uAsdlgTBGtatrpxhUAnw7Grnxj73'
  },
  {
    title: 'Food Bank Support',
    description: 'Help stock local food banks for families in need.',
    images: ['https://mitzvahday.org.uk/wp-content/uploads/2020/11/Naomi-Russell-Jo-Rosenblatt-1000x666.jpg'],
    progress: 60.0,
    goal: 8000,
    totalRaised: 4800,
    startDate: new Date('2024-03-10'),
    endDate: new Date('2024-04-10'),
    isApproved: true, 
    status:'active',


    UserId: 'NM0kL08MmZZD9X6HIPvKbHq2pTo1'
  },
  {
    title: 'Orphanage Renovation',
    description: 'Renovate facilities at local orphanage.',
    images: ['https://roots.uk.net/wp-content/uploads/2021/09/Roots-1024x723.png'],
    progress: 25.0,
    goal: 20000,
    totalRaised: 5000,
    startDate: new Date('2024-05-01'),
    endDate: new Date('2024-08-01'),
    isApproved: true, 
    status:'active',


    UserId: 'Jks4PbEyKrX4H7QwNxIE9FDCxjz1'
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