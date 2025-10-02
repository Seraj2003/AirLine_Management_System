const express = require('express');
const router = express.Router();
const { register, login, forgatePass, verifyOTP, changePass } = require('../controllers/authController.js');
const verifyToken = require('../middlewares/jwtVerification.js');

router.post('/register',register)
router.post('/login', login)
router.post('/send-otp',forgatePass)
router.post('/verify-otp', verifyToken,verifyOTP);
router.put('/change-pass',verifyToken,changePass)

module.exports = router;