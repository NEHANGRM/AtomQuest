const express = require('express');
const router = express.Router();
const { createGoalSheet, getMyGoalSheets, getTeamGoalSheets, updateGoalSheetStatus, updateAchievement } = require('../controllers/goalController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('employee', 'manager'), createGoalSheet);
router.get('/my', protect, getMyGoalSheets);
router.get('/team', protect, authorize('manager', 'admin'), getTeamGoalSheets);
router.put('/sheet/:id/status', protect, authorize('manager', 'admin'), updateGoalSheetStatus);
router.post('/:id/achievement', protect, authorize('employee', 'manager'), updateAchievement);

module.exports = router;
