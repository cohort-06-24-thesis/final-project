const { DonationItem } = require('../Database/index');

const seedDonationItems = async () => {
  try {
    const donationItems = [
      {
        title: 'Winter Clothes',
        description: 'Warm clothes for children in need, including jackets, sweaters, and gloves.',
        image: ['https://www.veteransplaceusa.org/wp-content/uploads/2019/12/Clothes-Donation-1024x683.jpg'],
        status: 'available',
        location: 'Tunis',
      },
      {
        title: 'School Supplies',
        description: 'New notebooks, pens, pencils, and backpacks for underprivileged students.',
        image: ['https://www.unicef.org/sites/default/files/styles/hero_desktop/public/UNI388200.jpg'],
        status: 'reserved',
        location: 'Sfax',
      },
      {
        title: 'Food Packages',
        description: 'Essential food items including rice, pasta, canned goods, and cooking oil.',
        image: ['https://www.wfpusa.org/wp-content/uploads/2021/03/2021-03-19-WFP-USA-Food-Basket-1.jpg'],
        status: 'claimed',
        location: 'Sousse',
      },
      {
        title: 'Medical Supplies',
        description: 'First aid kits, bandages, and basic medical equipment for local clinics.',
        image: ['https://www.who.int/images/default-source/health-topics/coronavirus/medical-supplies.tmb-1920v.jpg'],
        status: 'available',
        location: 'Bizerte',
      },
      {
        title: 'Books Collection',
        description: 'Educational books and children\'s storybooks in good condition.',
        image: ['https://www.unicef.org/sites/default/files/styles/hero_desktop/public/UNI388200.jpg'],
        status: 'available',
        location: 'Nabeul',
      },
      {
        title: 'Furniture Set',
        description: 'Gently used furniture including tables, chairs, and cabinets.',
        image: ['https://www.salvationarmy.org.au/wp-content/uploads/2020/03/furniture-donation.jpg'],
        status: 'reserved',
        location: 'Monastir',
      },
      {
        title: 'Toys and Games',
        description: 'New and gently used toys, board games, and educational materials.',
        image: ['https://www.unicef.org/sites/default/files/styles/hero_desktop/public/UNI388200.jpg'],
        status: 'available',
        location: 'Gabes',
      },
      {
        title: 'Hygiene Kits',
        description: 'Personal hygiene items including soap, shampoo, toothbrushes, and sanitary products.',
        image: ['https://www.unicef.org/sites/default/files/styles/hero_desktop/public/UNI388200.jpg'],
        status: 'available',
        location: 'Kairouan',
      },
      {
        title: 'Electronics',
        description: 'Working laptops, tablets, and smartphones for educational purposes.',
        image: ['https://www.unicef.org/sites/default/files/styles/hero_desktop/public/UNI388200.jpg'],
        status: 'reserved',
        location: 'Mahdia',
      },
      {
        title: 'Sports Equipment',
        description: 'Balls, rackets, and other sports gear for youth programs.',
        image: ['https://www.unicef.org/sites/default/files/styles/hero_desktop/public/UNI388200.jpg'],
        status: 'available',
        location: 'Zaghouan',
      },
      {
        title: 'Baby Essentials',
        description: 'Diapers, baby clothes, and feeding supplies for new mothers.',
        image: ['https://www.unicef.org/sites/default/files/styles/hero_desktop/public/UNI388200.jpg'],
        status: 'available',
        location: 'Ariana',
      },
      {
        title: 'Art Supplies',
        description: 'Paints, brushes, canvases, and other art materials for creative workshops.',
        image: ['https://www.unicef.org/sites/default/files/styles/hero_desktop/public/UNI388200.jpg'],
        status: 'reserved',
        location: 'Hammamet',
      },
      {
        title: 'Musical Instruments',
        description: 'Guitars, keyboards, and percussion instruments for music education.',
        image: ['https://www.unicef.org/sites/default/files/styles/hero_desktop/public/UNI388200.jpg'],
        status: 'available',
        location: 'Djerba',
      },
      {
        title: 'Gardening Tools',
        description: 'Shovels, rakes, and seeds for community garden projects.',
        image: ['https://www.unicef.org/sites/default/files/styles/hero_desktop/public/UNI388200.jpg'],
        status: 'available',
        location: 'Tozeur',
      },
      {
        title: 'Office Supplies',
        description: 'Printers, paper, and stationery for educational institutions.',
        image: ['https://www.unicef.org/sites/default/files/styles/hero_desktop/public/UNI388200.jpg'],
        status: 'reserved',
        location: 'Gafsa',
      },
      {
        title: 'Cooking Equipment',
        description: 'Pots, pans, and kitchen utensils for community kitchens.',
        image: ['https://www.unicef.org/sites/default/files/styles/hero_desktop/public/UNI388200.jpg'],
        status: 'available',
        location: 'Kasserine',
      },
      {
        title: 'Bicycle Collection',
        description: 'Used bicycles in good condition for transportation needs.',
        image: ['https://www.unicef.org/sites/default/files/styles/hero_desktop/public/UNI388200.jpg'],
        status: 'available',
        location: 'Beja',
      },
      {
        title: 'Emergency Kits',
        description: 'Flashlights, batteries, and emergency supplies for disaster preparedness.',
        image: ['https://www.unicef.org/sites/default/files/styles/hero_desktop/public/UNI388200.jpg'],
        status: 'reserved',
        location: 'Jendouba',
      },
      {
        title: 'Language Learning Materials',
        description: 'Books and audio materials for language education programs.',
        image: ['https://www.unicef.org/sites/default/files/styles/hero_desktop/public/UNI388200.jpg'],
        status: 'available',
        location: 'Tataouine',
      },
      {
        title: 'Recycling Bins',
        description: 'Collection of recycling containers for environmental initiatives.',
        image: ['https://www.unicef.org/sites/default/files/styles/hero_desktop/public/UNI388200.jpg'],
        status: 'available',
        location: 'Medenine',
      }
    ];

    await DonationItem.bulkCreate(donationItems);
    console.log('Donation items seeded successfully.');
  } catch (error) {
    console.error('Error seeding donation items:', error);
  }
};

module.exports = seedDonationItems;