const express = require ('express');
const { bookflight } = require('../controllers/bookingController.js');
const verifyToken = require('../middlewares/jwtVerification.js');
const router = express.Router()

router.post('/book', verifyToken,bookflight)


module.exports= router;