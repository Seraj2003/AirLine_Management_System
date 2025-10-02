const express = require('express');
const { getFlight, getflightDetailByNo } = require('../controllers/flightController.js')
const router = express.Router();

router.get('/', getFlight)
// this route only for admin to schedule new flights
router.get('/:flight_no', getflightDetailByNo)

module.exports = router;