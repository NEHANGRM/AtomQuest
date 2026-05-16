const User = require('../models/User');
const GoalSheet = require('../models/GoalSheet');
const AuditLog = require('../models/AuditLog');

const getDashboardStats = async (req, res) => {
  try {
    const usersCount = await User.countDocuments();
    const sheetsCount = await GoalSheet.countDocuments();
    const approvedCount = await GoalSheet.countDocuments({ status: 'approved' });
    res.json({ usersCount, sheetsCount, approvedCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const unlockGoalSheet = async (req, res) => {
  try {
    const sheet = await GoalSheet.findById(req.params.id);
    if (!sheet) return res.status(404).json({ message: 'Sheet not found' });
    sheet.status = 'returned';
    await sheet.save();
    res.json({ message: 'Sheet unlocked successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats, getAuditLogs, unlockGoalSheet };
