const express = require('express');
const router = express.Router();
const { getDashboardStats, getAuditLogs, unlockGoalSheet } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/audit', getAuditLogs);
router.put('/unlock/:id', unlockGoalSheet);

module.exports = router;
