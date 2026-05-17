const express = require('express');
const router = express.Router();
const { createCheckIn, getGoalCheckIns } = require('../controllers/checkInController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createCheckIn);
router.get('/goal/:goalId', protect, getGoalCheckIns);

module.exports = router;
