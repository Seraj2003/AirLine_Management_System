const express = require('express');
const verifyToken = require('../middlewares/jwtVerification.js');
const { addNewCrewMember , login } = require('../controllers/crewController.js');
const router = express.Router();



router.post('/assign' , verifyToken, addNewCrewMember  )
router.post('/login',login);

module.exports=router;