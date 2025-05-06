const { sequelize,DonationItem,Category } = require('../Database/index');
const { Sequelize, DataTypes } = require('sequelize');

const seedDonationItems = async () => {
  try {
    // Clear existing data
    await DonationItem.destroy({ where: {} });

    const Furniture = await Category.findOne({ where: { name: 'Furniture' } });
    const Electronics = await Category.findOne({ where: { name: 'Electronics' } });
    const Garden = await Category.findOne({ where: { name: 'Garden' } });
    const Appliances = await Category.findOne({ where: { name: 'Appliances' } });
    const DIY = await Category.findOne({ where: { name: 'DIY' } });
    const Home = await Category.findOne({ where: { name: 'Home' } });
    const Leisure = await Category.findOne({ where: { name: 'Leisure' } });
    const Sports = await Category.findOne({ where: { name: 'Sports' } });
    const Pets = await Category.findOne({ where: { name: 'Pets' } });
    const Kids = await Category.findOne({ where: { name: 'Kids' } });
    const Fashion = await Category.findOne({ where: { name: 'Fashion' } });
    const Beauty = await Category.findOne({ where: { name: 'Beauty' } });
    const Health = await Category.findOne({ where: { name: 'Health' } });
    const Food = await Category.findOne({ where: { name: 'Food' } });
    const Automotive = await Category.findOne({ where: { name: 'Automotive' } });
    const Office = await Category.findOne({ where: { name: 'Office' } });
    const Books = await Category.findOne({ where: { name: 'Books' } });


    // Define donation items
    const donationItems = [
      {
        title: 'Winter Clothes',
        description: 'Warm clothes for children in need, including jackets, sweaters, and gloves.',
        image: ['https://www.veteransplaceusa.org/wp-content/uploads/2019/12/Clothes-Donation-1024x683.jpg'],
        status: 'available',
        location: 'Tunis',
        latitude: 36.8065,
        longitude: 10.1815,
        categoryId: Fashion.id,
        UserId: 'Jks4PbEyKrX4H7QwNxIE9FDCxjz1'
      },
      {
        title: 'School Supplies',
        description: 'New notebooks, pens, pencils, and backpacks for underprivileged students.',
        image: ['https://i.ebayimg.com/images/g/Bv4AAOSwHSxjBXH3/s-l1200.jpg'],
        status: 'reserved',
        location: 'Sfax',
        latitude: 34.7405,
        longitude: 10.7603,
        categoryId: Kids.id,
        UserId: 'uDVoIeFDpVWDWisqxM76uP5MHcs1'
      },
      {
        title: 'Food Packages',
        description: 'Essential food items including rice, pasta, canned goods, and cooking oil.',
        image: ['https://5.imimg.com/data5/TJ/FA/XL/SELLER-31929298/packaging-services-for-food-items.jpg'],
        status: 'claimed',
        location: 'Sousse',
        latitude: 35.8256,
        longitude: 10.6368,
        categoryId: Food.id,
        UserId: 'uAsdlgTBGtatrpxhUAnw7Grnxj73'
      },
      {
        title: 'Medical Supplies',
        description: 'First aid kits, bandages, and basic medical equipment for local clinics.',
        image: ['https://doctoressentials.co.uk/cdn/shop/articles/xdoctor-essentials-medical-supplies-uk.jpg.pagespeed.ic.BQ2XIBfVAc.webp?v=1715289266&width=1280'],
        status: 'available',
        location: 'Bizerte',
        latitude: 37.2707,
        longitude: 9.8739,
        categoryId: Health.id,
        UserId: 'NM0kL08MmZZD9X6HIPvKbHq2pTo1'
      },
      {
        title: 'Books Collection',
        description: 'Educational books and children\'s storybooks in good condition.',
        image: ['https://www.elocalshops.com/cdn/shop/products/817dIguWe9L.jpg?v=1693770058'],
        status: 'available',
        location: 'Nabeul',
        latitude: 36.4575,
        longitude: 10.7382,
        categoryId: Books.id,
        UserId: 'Jks4PbEyKrX4H7QwNxIE9FDCxjz1'
      },
      {
        title: 'Furniture Set',
        description: 'Gently used furniture including tables, chairs, and cabinets.',
        image: ['https://5.imimg.com/data5/SELLER/Default/2023/9/344499330/AO/JT/HS/62046965/full-size-teak-wood-bed-500x500.jpg'],
        status: 'reserved',
        location: 'Monastir',
        latitude: 35.7624,
        longitude: 10.8312,
        categoryId: Furniture.id,
        UserId: 'uDVoIeFDpVWDWisqxM76uP5MHcs1'
      },
      {
        title: 'Toys and Games',
        description: 'New and gently used toys, board games, and educational materials.',
        image: ['https://www.uttamtoys.com/wp-content/uploads/2023/07/Toys-Games-Category-icon.png'],
        status: 'available',
        location: 'Gabes',
        latitude: 33.8839,
        longitude: 10.0971,
        categoryId: Kids.id,
        UserId: 'uAsdlgTBGtatrpxhUAnw7Grnxj73'
      },
      {
        title: 'Hygiene Kits',
        description: 'Personal hygiene items including soap, shampoo, toothbrushes, and sanitary products.',
        image: ['https://assets.aboutamazon.com/dims4/default/3f9d820/2147483647/strip/true/crop/1220x686+0+0/resize/1220x686!/quality/90/?url=https%3A%2F%2Famazon-blogs-brightspot.s3.amazonaws.com%2Fe7%2F21%2F6eb107654cfe8f6f96c1eebb8ab1%2Fukraine-hygiene-kit-amazon.jpg'],
        status: 'available',
        location: 'Kairouan',
        latitude: 35.6782,
        longitude: 10.1011,
        categoryId: Beauty.id,
        UserId: 'NM0kL08MmZZD9X6HIPvKbHq2pTo1'
      },
      {
        title: 'Chauffage',
        description: 'Electric heaters for families in need during the winter season.',
        image: ['https://spacenet.tn/113074-large_default/chauffage-electrique-home-electronics-1200-watt-gris-tchh12bs.jpg'],
        status: 'reserved',
        location: 'Mahdia',
        latitude: 35.5042,
        longitude: 11.0628,
        categoryId: Appliances.id,
        UserId: 'Jks4PbEyKrX4H7QwNxIE9FDCxjz1'
      },
      {
        title: 'Sports Equipment',
        description: 'Balls, rackets, and other sports gear for youth programs.',
        image: ['https://img.freepik.com/premium-photo/set-different-sports-equipment-white-background_495423-47354.jpg'],
        status: 'available',
        location: 'Zaghouan',
        latitude: 36.4002,
        longitude: 10.1482,
        categoryId: Sports.id,
        UserId: 'uDVoIeFDpVWDWisqxM76uP5MHcs1'
      },
      {
        title: 'Baby Essentials',
        description: 'Diapers, baby clothes, and feeding supplies for new mothers.',
        image: ['https://www.bundleofjoybaskets.com/cdn/shop/products/20160919_115739.jpg'],
        status: 'available',
        location: 'Ariana',
        latitude: 36.8663,
        longitude: 10.1956,
        categoryId: Kids.id,
        UserId: 'uAsdlgTBGtatrpxhUAnw7Grnxj73'
      },
      {
        title: 'Art Supplies',
        description: 'Paints, brushes, canvases, and other art materials for creative workshops.',
        image: ['https://m.media-amazon.com/images/I/81BrCSk5T3L._AC_SL1500_.jpg'],
        status: 'reserved',
        location: 'Hammamet',
        latitude: 36.4002,
        longitude: 10.6122,
        categoryId: Leisure.id,
        UserId: 'NM0kL08MmZZD9X6HIPvKbHq2pTo1'
      },
      {
        title: 'Musical Instruments',
        description: 'Guitars, keyboards, and percussion instruments for music education.',
        image: ['https://www.tickit.co.uk/cdn/shop/files/TickiT_Percussion_Set_85101_A_2919ddff-5d5f-4ad1-bc38-2a7673c6235d.jpg?crop=center&height=1200&v=1736078986&width=1200'],
        status: 'available',
        location: 'Djerba',
        latitude: 33.8792,
        longitude: 10.8578,
        categoryId: Leisure.id,
        UserId: 'Jks4PbEyKrX4H7QwNxIE9FDCxjz1'
      },
      {
        title: 'Gardening Tools',
        description: 'Shovels, rakes, and seeds for community garden projects.',
        image: ['https://spicymoustache.com/wp-content/uploads/2024/10/gardening-tools-GA-cover-800x568-1.png'],
        status: 'available',
        location: 'Tozeur',
        latitude: 33.9012,
        longitude: 8.1134,
        categoryId: Garden.id,
        UserId: 'uDVoIeFDpVWDWisqxM76uP5MHcs1'
      },
      {
        title: 'Office Supplies',
        description: 'Printers, paper, and stationery for educational institutions.',
        image: ['https://img.freepik.com/premium-photo/school-equipment-table_200402-858.jpg?semt=ais_hybrid&w=740'],
        status: 'reserved',
        location: 'Gafsa',
        latitude: 34.4214,
        longitude: 8.7802,
        categoryId: Office.id,
        UserId: 'uAsdlgTBGtatrpxhUAnw7Grnxj73'
      },
      {
        title: 'Cooking Equipment',
        description: 'Pots, pans, and kitchen utensils for community kitchens.',
        image: ['https://cdn.prod.website-files.com/660856e6a9a1ca9e3d9269ad/66841798befeb1986c7eb929_15%20Must-Have%20Kitchen%20Tools%20to%20Cook%20Like%20a%20Pro%20(1).webp'],
        status: 'available',
        location: 'Kasserine',
        latitude: 35.1667,
        longitude: 8.8342,
        categoryId: Appliances.id,
        UserId: 'NM0kL08MmZZD9X6HIPvKbHq2pTo1'
      },
      {
        title: 'Bicycle',
        description: 'Bicycles for children and adults to promote eco-friendly transportation.',
        image: ['https://images.offerup.com/BhPx1TyK6awpTNLXi1En3NKq1r8=/250x250/af12/af1213572be843d4bed0f997174dc748.jpg'],
        status: 'available',
        location: 'Beja',
        latitude: 36.7375,
        longitude: 9.1815,
        categoryId: Sports.id,
        UserId: 'Jks4PbEyKrX4H7QwNxIE9FDCxjz1'
      },
      {
        title: 'Emergency Kits',
        description: 'Flashlights, batteries, and emergency supplies for disaster preparedness.',
        image: ['https://i.ebayimg.com/images/g/svMAAOSwOrxZwXyg/s-l1200.jpg'],
        status: 'reserved',
        location: 'Jendouba',
        latitude: 36.5000,
        longitude: 8.7800,
        categoryId: Health.id,
        UserId: 'uDVoIeFDpVWDWisqxM76uP5MHcs1'
      },
      {
        title: 'Language Learning Materials',
        description: 'Books and audio materials for language education programs.',
        image: ['https://m.media-amazon.com/images/I/91gmmI4J92L.jpg'],
        status: 'available',
        location: 'Tataouine',
        latitude: 32.9300,
        longitude: 10.4500,
        categoryId: Books.id,
        UserId: 'uAsdlgTBGtatrpxhUAnw7Grnxj73'
      },
      {
        title: 'Recycling Bins',
        description: 'Collection of recycling containers for environmental initiatives.',
        image: ['https://i.redd.it/d7b9wd3bsejc1.jpeg'],
        status: 'available',
        location: 'Medenine',
        latitude: 33.3500,
        longitude: 10.5000,
        categoryId: DIY.id,
        UserId: 'NM0kL08MmZZD9X6HIPvKbHq2pTo1'
      }
    ];

    await DonationItem.bulkCreate(donationItems);
    console.log('Donation items seeded successfully.');
  } catch (error) {
    console.error('Error seeding donation items:', error);
  }
};

module.exports = seedDonationItems;