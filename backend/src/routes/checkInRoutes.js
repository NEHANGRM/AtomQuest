const express = require('express');
const router = express.Router();
const { createCheckIn, getGoalCheckIns, addManagerFeedback } = require('../controllers/checkInController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('employee', 'manager'), createCheckIn);
router.get('/goal/:goalId', protect, getGoalCheckIns);
router.put('/:id/feedback', protect, authorize('manager', 'admin'), addManagerFeedback);

module.exports = router;
