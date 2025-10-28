const express = require ('express');
const { bookflight , ticketView ,cancel} = require('../controllers/bookingController.js');
const verifyToken = require('../middlewares/jwtVerification.js');
const router = express.Router()

router.post('/book', verifyToken,bookflight);
//ticket view 
router.get('/ticket/detail',ticketView);
router.put('/ticket/cancel',verifyToken,cancel)

module.exports= router;