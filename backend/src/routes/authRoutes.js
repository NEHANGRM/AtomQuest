const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, seedDemoAccounts, updateUserProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateUserProfile);
router.get('/seed', seedDemoAccounts); // Dev/prod seeding endpoint

module.exports = router;
