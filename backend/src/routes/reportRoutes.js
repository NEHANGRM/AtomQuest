const express = require('express');
const router = express.Router();
const { exportGoalCompletion, exportQuarterlyAchievements, getAnalyticsDashboard } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin', 'manager')); // Managers should probably be able to export reports too

router.get('/goal-completion', exportGoalCompletion);
router.get('/quarterly', exportQuarterlyAchievements);
router.get('/analytics', getAnalyticsDashboard);

module.exports = router;
