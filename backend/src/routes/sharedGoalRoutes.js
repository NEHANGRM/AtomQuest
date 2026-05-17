const express = require('express');
const router = express.Router();
const { createSharedGoal, getManagerSharedGoals, getEmployeeAssignedSharedGoals, updateSharedGoal } = require('../controllers/sharedGoalController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('manager', 'admin'), createSharedGoal);
router.get('/manager', protect, authorize('manager', 'admin'), getManagerSharedGoals);
router.get('/employee', protect, authorize('employee', 'manager'), getEmployeeAssignedSharedGoals);
router.put('/:id', protect, authorize('manager', 'admin'), updateSharedGoal);

module.exports = router;
