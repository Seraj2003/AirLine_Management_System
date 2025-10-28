const express = require('express');
const dotenv = require('dotenv').config();
const statusMonitor = require('express-status-monitor')
const cookieParser = require('cookie-parser');
const authRouter = require('./routers/authRouter.js')
const userRouter = require('./routers/userRouter.js')
const flightRouter = require('./routers/flightRouter.js')
const bookingRouter = require('./routers/bookingRouter.js');
const crewRouter = require('./routers/crewRouter.js')
const db = require('./config/db.js');
const app = express()

const PORT = process.env.PORT || 9000;

//middlewares 
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(statusMonitor())



//Authentication and user management
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
//flight management 
app.use('/api/flight', flightRouter);
// booking system
app.use('/api/booking', bookingRouter);
//crew 
app.use('/crew', crewRouter);


app.listen(PORT, () => {
    console.log(`server running on http//localhost:${PORT}`)
})