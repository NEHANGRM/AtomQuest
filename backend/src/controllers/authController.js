const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
};

const registerUser = async (req, res) => {
  const { name, email, password, role, managerId } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password, role, managerId });
    if (user) {
      res.status(201).json({
        _id: user._id, name: user.name, email: user.email, role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id, name: user.name, email: user.email, role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMe = async (req, res) => {
  res.json(req.user);
};

const seedDemoAccounts = async (req, res) => {
  try {
    const demoUsers = [
      { name: 'System Admin', email: 'admin@gmail.com', password: 'admin', role: 'admin', department: 'IT' },
      { name: 'Jane Manager', email: 'manager@gmail.com', password: 'manager', role: 'manager', department: 'Engineering' },
      { name: 'Demo User', email: 'demouser@gmail.com', password: 'user', role: 'employee', department: 'Engineering' },
    ];

    const results = [];
    // Ensure clean cleanup of old employee account
    await User.deleteOne({ email: 'emp@test.com' });

    for (const demo of demoUsers) {
      // Delete existing and recreate so password hash is fresh
      await User.deleteOne({ email: demo.email });
      const user = await User.create(demo);
      results.push({ created: user.email, role: user.role });
    }

    res.json({ message: 'Demo accounts seeded successfully!', results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        token: generateToken(updatedUser._id)
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, getMe, seedDemoAccounts, updateUserProfile };

