const SharedGoal = require('../models/SharedGoal');
const Goal = require('../models/Goal');

// @desc    Create a Shared Goal
// @route   POST /api/shared-goals
// @access  Private (Manager/Admin)
const createSharedGoal = async (req, res) => {
  const { thrustArea, title, description, uomType, target, timeline, assignedTo } = req.body;
  try {
    const sharedGoal = await SharedGoal.create({
      createdBy: req.user._id, thrustArea, title, description, uomType, target, timeline, assignedTo
    });
    res.status(201).json(sharedGoal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Shared Goals created by Manager
// @route   GET /api/shared-goals/manager
// @access  Private (Manager/Admin)
const getManagerSharedGoals = async (req, res) => {
  try {
    const sharedGoals = await SharedGoal.find({ createdBy: req.user._id }).populate('assignedTo', 'name email');
    res.json(sharedGoals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Shared Goals assigned to Employee
// @route   GET /api/shared-goals/employee
// @access  Private (Employee)
const getEmployeeAssignedSharedGoals = async (req, res) => {
  try {
    const sharedGoals = await SharedGoal.find({ assignedTo: req.user._id });
    res.json(sharedGoals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Shared Goal & Sync
// @route   PUT /api/shared-goals/:id
// @access  Private (Manager/Admin)
const updateSharedGoal = async (req, res) => {
  const { thrustArea, title, description, uomType, target, timeline, assignedTo } = req.body;
  try {
    const sharedGoal = await SharedGoal.findById(req.params.id);
    if (!sharedGoal) return res.status(404).json({ message: 'Not found' });
    if (sharedGoal.createdBy.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    
    if (thrustArea) sharedGoal.thrustArea = thrustArea;
    if (title) sharedGoal.title = title;
    if (description) sharedGoal.description = description;
    if (uomType) sharedGoal.uomType = uomType;
    if (target) sharedGoal.target = target;
    if (timeline) sharedGoal.timeline = timeline;
    if (assignedTo) sharedGoal.assignedTo = assignedTo;
    
    await sharedGoal.save();

    // Sync all existing linked Goals
    await Goal.updateMany(
      { sharedGoalId: sharedGoal._id },
      { $set: { 
          thrustArea: sharedGoal.thrustArea, 
          title: sharedGoal.title, 
          description: sharedGoal.description, 
          uomType: sharedGoal.uomType, 
          target: sharedGoal.target 
        } 
      }
    );

    res.json(sharedGoal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createSharedGoal, getManagerSharedGoals, getEmployeeAssignedSharedGoals, updateSharedGoal };
