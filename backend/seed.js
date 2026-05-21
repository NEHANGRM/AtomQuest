const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { seedDatabase } = require('./src/utils/seeder');

dotenv.config();

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/atomquest';
    console.log('Connecting to MongoDB for Seeding (Root)...');
    await mongoose.connect(mongoUri, { family: 4 });
    console.log('Connected! Starting seeding...');
    await seedDatabase();
    console.log('Database Seeded Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Failed:', error);
    process.exit(1);
  }
};

seedDB();
