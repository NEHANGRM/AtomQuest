const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, seedDemoAccounts } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.get('/seed', seedDemoAccounts); // Dev/prod seeding endpoint

module.exports = router;
