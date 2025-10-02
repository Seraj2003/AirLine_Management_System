const nodemailer = require('nodemailer')
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",   // Gmail SMTP server
    port: 587,                // or 465 (SSL)
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        password: process.env.EMAIL_PASS
    }

})


module.exports = transporter