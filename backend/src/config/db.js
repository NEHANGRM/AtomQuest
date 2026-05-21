const mongoose = require('mongoose');
let mongoServer;

const connectDB = async () => {
  try {
    console.log('Attempting connection to MongoDB Atlas...');
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/atomquest', {
      serverSelectionTimeoutMS: 5000,
      family: 4
    });
    console.log(`MongoDB Connected (Atlas/Local): ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Failed: ${error.message}`);
    console.log('Falling back to in-memory MongoDB server (MongoMemoryServer)...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      console.log(`In-Memory MongoDB Server started at: ${mongoUri}`);
      const conn = await mongoose.connect(mongoUri);
      console.log(`MongoDB Connected (In-Memory): ${conn.connection.host}`);
      
      // Auto-seed in-memory database since it starts empty
      console.log('Auto-seeding in-memory database with demo records...');
      const { seedDatabase } = require('../utils/seeder');
      await seedDatabase();
      console.log('Auto-seeding completed successfully!');
    } catch (fallbackError) {
      console.error(`In-Memory MongoDB fallback failed: ${fallbackError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
