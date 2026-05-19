const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB using URI:', process.env.MONGO_URI ? 'URI exists (hidden)' : 'UNDEFINED!');
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/atomquest', {
      serverSelectionTimeoutMS: 5000,
      family: 4
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
