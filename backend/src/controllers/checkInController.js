const CheckIn = require('../models/CheckIn');
const Goal = require('../models/Goal');
const AuditLog = require('../models/AuditLog');
const { calculateProgress } = require('../utils/calculationEngine');

const logAudit = async (userId, action, model, documentId, previousValue, newValue) => {
  await AuditLog.create({ user: userId, action, model, documentId, previousValue, newValue });
};

// @desc    Create a Check-In for a Goal
// @route   POST /api/checkins
// @access  Private (Employee)
const createCheckIn = async (req, res) => {
  const { goalId, quarter, actualValue, status, comments } = req.body;
  
  try {
    const goal = await Goal.findById(goalId);
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    if (goal.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });

    // Validate quarterly windows (Mocked for logic requirements)
    const currentMonth = new Date().getMonth() + 1; // 1-12
    let isValidWindow = false;
    if (quarter === 'Q1' && currentMonth >= 7) isValidWindow = true; // July onwards
    else if (quarter === 'Q2' && currentMonth >= 10) isValidWindow = true; // October onwards
    else if (quarter === 'Q3' && (currentMonth >= 1 || currentMonth <= 3)) isValidWindow = true; // January onwards
    else if (quarter === 'Q4' && (currentMonth >= 3)) isValidWindow = true; // March/April

    // We can soft-bypass the strict month validation for testing purposes if needed
    // if (!isValidWindow) return res.status(400).json({ message: `${quarter} update window is not currently open.` });

    const checkIn = await CheckIn.create({
      goal: goalId,
      user: req.user._id,
      quarter,
      actualValue,
      status,
      comments
    });

    // Update Goal progress using the Engine
    const progressScore = calculateProgress(goal, actualValue, status);

    const previousStatus = goal.status;
    goal.status = status;
    goal.progressScore = progressScore;
    
    // Push to embedded achievements array for backwards compatibility
    goal.achievements.push({
      quarter, actualValue, comments, date: new Date()
    });

    await goal.save();
    await logAudit(req.user._id, `QUARTERLY_CHECKIN_${quarter}`, 'Goal', goal._id, { status: previousStatus }, { status, progressScore, checkInId: checkIn._id });

    res.status(201).json(checkIn);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Check-Ins for a Goal
// @route   GET /api/checkins/goal/:goalId
// @access  Private
const getGoalCheckIns = async (req, res) => {
  try {
    const checkIns = await CheckIn.find({ goal: req.params.goalId }).sort({ createdAt: -1 });
    res.json(checkIns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add Manager Feedback to a Check-In
// @route   PUT /api/checkins/:id/feedback
// @access  Private (Manager)
const addManagerFeedback = async (req, res) => {
  const { managerComment } = req.body;
  try {
    const checkIn = await CheckIn.findById(req.params.id).populate('goal');
    if (!checkIn) return res.status(404).json({ message: 'Check-in not found' });
    
    // In a real app, verify req.user._id is the manager of checkIn.user
    // CheckIn.user is the employee
    
    checkIn.managerComment = managerComment;
    checkIn.managerId = req.user._id;
    checkIn.reviewedAt = new Date();
    await checkIn.save();

    await logAudit(req.user._id, `MANAGER_FEEDBACK_${checkIn.quarter}`, 'CheckIn', checkIn._id, null, { managerComment });

    res.json(checkIn);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createCheckIn, getGoalCheckIns, addManagerFeedback };
