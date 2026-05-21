const User = require('../models/User');
const GoalSheet = require('../models/GoalSheet');
const AuditLog = require('../models/AuditLog');
const Goal = require('../models/Goal');
const { triggerNotification } = require('../utils/notifications');

const getDashboardStats = async (req, res) => {
  try {
    const usersCount = await User.countDocuments();
    const sheets = await GoalSheet.find().populate('goals');
    
    let totalProgress = 0;
    let totalGoals = 0;

    sheets.forEach(sheet => {
      sheet.goals.forEach(goal => {
        totalProgress += goal.progressScore || 0;
        totalGoals += 1;
      });
    });

    const avgCompletion = totalGoals === 0 ? 0 : Math.round(totalProgress / totalGoals);
    
    const submittedCount = sheets.filter(s => s.status === 'submitted').length;
    const approvedCount = sheets.filter(s => s.status === 'approved').length;
    const draftCount = sheets.filter(s => s.status === 'draft' || s.status === 'returned').length;

    res.json({ 
      usersCount, 
      sheetsCount: sheets.length, 
      approvedCount, 
      submittedCount,
      draftCount,
      avgCompletion 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAuditLogs = async (req, res) => {
  const { search, action, modelFilter } = req.query;

  try {
    let query = {};
    if (action && action !== 'All') query.action = { $regex: new RegExp(action, 'i') };
    if (modelFilter && modelFilter !== 'All') query.model = modelFilter;
    
    // For search, we might want to search user name, which requires a more complex query or populated filtering.
    // For simplicity, we'll fetch and then filter if a search term exists.
    
    let logs = await AuditLog.find(query).populate('user', 'name email role').sort({ createdAt: -1 });

    if (search) {
      const lowerSearch = search.toLowerCase();
      logs = logs.filter(log => 
        log.user?.name.toLowerCase().includes(lowerSearch) || 
        log.user?.email.toLowerCase().includes(lowerSearch) ||
        log.action.toLowerCase().includes(lowerSearch) ||
        (log.documentId && log.documentId.toString().includes(lowerSearch))
      );
    }

    res.json(logs.slice(0, 100)); // Limit to top 100 results after filter
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const unlockGoalSheet = async (req, res) => {
  try {
    const sheet = await GoalSheet.findById(req.params.id);
    if (!sheet) return res.status(404).json({ message: 'Sheet not found' });
    
    const previousStatus = sheet.status;
    sheet.status = 'returned';
    sheet.managerComments = "Unlocked by Admin for editing.";
    await sheet.save();

    await AuditLog.create({
      user: req.user._id,
      action: 'ADMIN_UNLOCK_SHEET',
      model: 'GoalSheet',
      documentId: sheet._id,
      previousValue: { status: previousStatus },
      newValue: { status: 'returned' }
    });

    // Notify employee
    await triggerNotification(
      sheet.user,
      'Goal Sheet Unlocked',
      `Your goal sheet was unlocked by an administrator for editing.`,
      'warning',
      { entityModel: 'GoalSheet', entityId: sheet._id }
    );

    // Notify employee's manager
    const employeeUser = await User.findById(sheet.user);
    if (employeeUser && employeeUser.managerId) {
      await triggerNotification(
        employeeUser.managerId,
        'Goal Sheet Unlocked by Admin',
        `Admin unlocked the goal sheet of ${employeeUser.name}.`,
        'info',
        { entityModel: 'GoalSheet', entityId: sheet._id }
      );
    }

    res.json({ message: 'Sheet unlocked successfully', sheet });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- User Management ---
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').populate('managerId', 'name email');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createUser = async (req, res) => {
  const { name, email, password, role, department, managerId } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password, role, department, managerId: managerId || null });
    
    await AuditLog.create({ user: req.user._id, action: 'ADMIN_CREATE_USER', model: 'User', documentId: user._id, previousValue: null, newValue: { email, role } });
    
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  const { name, role, department, managerId } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (role) user.role = role;
    if (department) user.department = department;
    if (managerId !== undefined) user.managerId = managerId || null;

    await user.save();
    
    await AuditLog.create({ user: req.user._id, action: 'ADMIN_UPDATE_USER', model: 'User', documentId: user._id, previousValue: null, newValue: { name, role, department } });

    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await User.findByIdAndDelete(req.params.id);
    
    await AuditLog.create({ user: req.user._id, action: 'ADMIN_DELETE_USER', model: 'User', documentId: user._id, previousValue: { email: user.email }, newValue: null });

    res.json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Organization Progress ---
const getAllGoalSheets = async (req, res) => {
  try {
    const sheets = await GoalSheet.find().populate('user', 'name email department').populate('goals').sort({ updatedAt: -1 });
    res.json(sheets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  getDashboardStats, 
  getAuditLogs, 
  unlockGoalSheet, 
  getAllUsers, 
  createUser, 
  updateUser, 
  deleteUser,
  getAllGoalSheets 
};
