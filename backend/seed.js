const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['employee', 'manager', 'admin'], default: 'employee' },
  department: { type: String },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { family: 4 });
    console.log('MongoDB Connected for Seeding');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Clear existing (if any)
    await User.deleteMany({ email: { $in: ['admin@test.com', 'manager@test.com', 'emp@test.com'] } });

    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@test.com',
      password: hashedPassword,
      role: 'admin',
      department: 'IT'
    });

    const manager = await User.create({
      name: 'Jane Manager',
      email: 'manager@test.com',
      password: hashedPassword,
      role: 'manager',
      department: 'Engineering'
    });

    const employee = await User.create({
      name: 'John Employee',
      email: 'emp@test.com',
      password: hashedPassword,
      role: 'employee',
      department: 'Engineering',
      managerId: manager._id
    });

    console.log('Demo accounts created successfully!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedUsers();
