const Goal = require('../models/Goal');
const GoalSheet = require('../models/GoalSheet');
const AuditLog = require('../models/AuditLog');

const logAudit = async (userId, action, model, documentId, previousValue, newValue) => {
  await AuditLog.create({ user: userId, action, model, documentId, previousValue, newValue });
};

// @desc    Create a Goal Sheet and Goals
// @route   POST /api/goals
// @access  Private (Employee)
const createGoalSheet = async (req, res) => {
  const { year, goals, status = 'submitted' } = req.body;
  
  try {
    const totalWeightage = goals.reduce((acc, goal) => acc + Number(goal.weightage || 0), 0);
    
    if (status === 'submitted') {
      if (totalWeightage !== 100) return res.status(400).json({ message: 'Total weightage must be exactly 100% to submit.' });
      if (goals.length > 8) return res.status(400).json({ message: 'Maximum 8 goals allowed.' });
      if (goals.some(g => Number(g.weightage) < 10)) return res.status(400).json({ message: 'Minimum weightage per goal is 10%.' });
    } else {
      if (totalWeightage > 100) return res.status(400).json({ message: 'Total weightage cannot exceed 100%.' });
      if (goals.length > 8) return res.status(400).json({ message: 'Maximum 8 goals allowed.' });
    }

    const goalSheet = await GoalSheet.create({ user: req.user._id, year, status });
    
    const createdGoals = [];
    for (const g of goals) {
      const goal = await Goal.create({ ...g, user: req.user._id, goalSheet: goalSheet._id });
      createdGoals.push(goal._id);
    }
    
    goalSheet.goals = createdGoals;
    await goalSheet.save();

    await logAudit(req.user._id, 'CREATE_GOAL_SHEET', 'GoalSheet', goalSheet._id, null, goalSheet);

    res.status(201).json(goalSheet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Employee's Goal Sheets
// @route   GET /api/goals/my
// @access  Private
const getMyGoalSheets = async (req, res) => {
  try {
    const goalSheets = await GoalSheet.find({ user: req.user._id }).populate('goals');
    res.json(goalSheets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Goal Sheets for Manager's Team
// @route   GET /api/goals/team
// @access  Private (Manager)
const getTeamGoalSheets = async (req, res) => {
  try {
    // Find all users managed by req.user._id
    const team = await require('../models/User').find({ managerId: req.user._id });
    const teamIds = team.map(t => t._id);
    const goalSheets = await GoalSheet.find({ user: { $in: teamIds } }).populate('user', 'name email').populate('goals');
    res.json(goalSheets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve/Reject Goal Sheet
// @route   PUT /api/goals/sheet/:id/status
// @access  Private (Manager)
const updateGoalSheetStatus = async (req, res) => {
  const { status, managerComments } = req.body;
  try {
    const sheet = await GoalSheet.findById(req.params.id);
    if (!sheet) return res.status(404).json({ message: 'Goal sheet not found' });
    
    const previousStatus = sheet.status;
    sheet.status = status;
    if (managerComments) sheet.managerComments = managerComments;
    await sheet.save();

    await logAudit(req.user._id, `UPDATE_SHEET_STATUS_${status.toUpperCase()}`, 'GoalSheet', sheet._id, { status: previousStatus }, { status });

    res.json(sheet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Quarterly Achievement
// @route   POST /api/goals/:id/achievement
// @access  Private
const updateAchievement = async (req, res) => {
  const { quarter, actualValue, comments } = req.body;
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    
    // Formula calculation
    let progressScore = 0;
    if (goal.uomType === 'Numeric' || goal.uomType === 'Percentage') {
       progressScore = (Number(actualValue) / goal.target) * 100;
    } else if (goal.uomType === 'Zero-based') {
       progressScore = Number(actualValue) === 0 ? 100 : 0;
    } else if (goal.uomType === 'Timeline') {
       // simplistically just mark based on status/actualValue if timeline
       progressScore = 100;
    }
    
    const newAchievement = { quarter, actualValue: Number(actualValue), comments };
    goal.achievements.push(newAchievement);
    goal.progressScore = progressScore; 
    
    if (progressScore >= 100) goal.status = 'Completed';
    else if (progressScore > 0) goal.status = 'On Track';
    
    await goal.save();
    await logAudit(req.user._id, 'UPDATE_ACHIEVEMENT', 'Goal', goal._id, null, newAchievement);

    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a Draft Goal Sheet
// @route   PUT /api/goals/sheet/:id
// @access  Private (Employee)
const updateGoalSheet = async (req, res) => {
  const { goals, status } = req.body;
  try {
    const sheet = await GoalSheet.findById(req.params.id);
    if (!sheet) return res.status(404).json({ message: 'Goal sheet not found' });
    if (sheet.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    if (sheet.status !== 'draft' && sheet.status !== 'returned') return res.status(400).json({ message: 'Can only edit draft or returned sheets' });

    const totalWeightage = goals.reduce((acc, goal) => acc + Number(goal.weightage || 0), 0);
    if (status === 'submitted') {
      if (totalWeightage !== 100) return res.status(400).json({ message: 'Total weightage must be exactly 100% to submit.' });
      if (goals.length > 8) return res.status(400).json({ message: 'Maximum 8 goals allowed.' });
      if (goals.some(g => Number(g.weightage) < 10)) return res.status(400).json({ message: 'Minimum weightage per goal is 10%.' });
    } else {
      if (totalWeightage > 100) return res.status(400).json({ message: 'Total weightage cannot exceed 100%.' });
      if (goals.length > 8) return res.status(400).json({ message: 'Maximum 8 goals allowed.' });
    }

    // Delete old goals
    await Goal.deleteMany({ _id: { $in: sheet.goals } });

    // Create new goals
    const createdGoals = [];
    for (const g of goals) {
      const goal = await Goal.create({ ...g, user: req.user._id, goalSheet: sheet._id });
      createdGoals.push(goal._id);
    }

    sheet.goals = createdGoals;
    sheet.status = status || sheet.status;
    await sheet.save();

    await logAudit(req.user._id, 'UPDATE_GOAL_SHEET', 'GoalSheet', sheet._id, null, sheet);
    res.json(sheet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createGoalSheet, updateGoalSheet, getMyGoalSheets, getTeamGoalSheets, updateGoalSheetStatus, updateAchievement };
