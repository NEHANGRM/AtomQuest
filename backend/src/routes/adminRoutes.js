const express = require('express');
const router = express.Router();
const { 
  getDashboardStats, 
  getAuditLogs, 
  unlockGoalSheet, 
  getAllUsers, 
  createUser, 
  updateUser, 
  deleteUser,
  getAllGoalSheets 
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

// Analytics & Audit
router.get('/stats', getDashboardStats);
router.get('/audit', getAuditLogs);

// Goal Sheets
router.get('/sheets', getAllGoalSheets);
router.put('/unlock/:id', unlockGoalSheet);

// User Management
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

module.exports = router;
