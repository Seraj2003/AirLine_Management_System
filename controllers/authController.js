const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const db = require('../config/db.js');
const transporter = require('../config/nodemailer.js')

// console.log(process.env.SECRET)
const register = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'missing details' })
    }
    try {
        const [ExsitingUser] = await db.query('SELECT *from users WHERE email = ?', [email])
        console.log(ExsitingUser)
        if (ExsitingUser.length > 0) {
            return res.status(404).json({ success: false, message: 'User already Exsiting. Try another Email Address' })
        }
        const hashpassword = await bcrypt.hash(password, 10)
        const user = await db.query('INSERT INTO users (name,email,password) VALUES (?,?,?)', [name, email, hashpassword])
        // generating jwt token
        const token = jwt.sign(
            { user_id: user.id, email: user.email },                       // payload
            process.env.SECRET,                                           // must exist
            { expiresIn: '1d' }                                           // valid 1 day
        );

        res.status(200).json({ success: true, message: 'User Register Successfully', token })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Internal servver error' + error })
    }
}
//login 
const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(404).json({ success: false, message: 'Missing details' })
    }
    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = users[0];
        if (users.length == 0) return res.status(404).json({ success: false, message: 'User not register' })
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) return res.status(404).json({ success: false, message: 'Inavalid password' });

        //generating token
        const token = jwt.sign({ user_id: user.id, email },
            process.env.SECRET,
            { expiresIn: '1d' }
        )

        res.status(200).json({ success: true, message: 'Login Successfully', token })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Internal servver error' + error })
    }
}
//reset password
const forgatePass = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(4040).json({ success: false, message: 'missing details' });
    try {
        const users = await db.query('Select * from users where email = ? ', [email])
        const [user] = users[0]
        if (!users) return res.status(400).json({ success: false, message: 'Invalid Email' })

        const otp = Math.floor(1000 + Math.random() * 9000);
        console.log(user)
        const token = jwt.sign(
            { email: user.email },                       // payload
            process.env.SECRET,                                           // must exist
            { expiresIn: '1d' }                                           // valid 1 day
        );
        console.log(otp)
        // await transporter.sendMail({
        //     from: process.env.EMAIL_USER,
        //     to: email,
        //     subject: 'OTP Verification',
        //     text: `Your OTP code is ${otp}. It is valid for 5 minutes.`
        // })
        const expiryDate = new Date(Date.now() + 5 * 60 * 1000);
        const mysqlexpiry = expiryDate.toISOString().slice(0, 19).replace('T', ' ');
        await db.query('UPDATE users SET reset_otp = ?, reset_otp_expiry = ?  WHERE email = ? ', [otp, mysqlexpiry, email])
        res.status(200).json({ success: true, message: 'OTP Send Successfully' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Internal servver error' + error })
    }
}
// otp verification 
const verifyOTP = async (req, res) => {
    const { otp, newPassword } = req.body;
    const email = req.user.email;
    if (!otp || !newPassword) return res.status(404).json({ success: false, message: 'missing OTP and New Password' });
    try {
        const users = await db.query('select *from users where email = ? ', [email])
        const [user] = users[0];
        if (!user) res.status(200).json({ success: false, message: 'User not found' });
        if (Number(user.reset_otp) !== Number(otp)) {
            return res.status(404).json({ success: false, message: 'Invalid OTP' })
        }
        const hashpassword = await bcrypt.hash(newPassword, 10);
        await db.query("UPDATE users SET password = ?,  reset_otp = NULL, reset_otp_expiry = NULL  WHERE email = ?", [hashpassword, user.email])

        res.status(200).json({ success: true, message: 'Passworld Forgate Successfully' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Internal server error' + error })
    }
}
//  change password
const changePass = async (req, res) => {
    const { currentPass, newPassword } = req.body;
    const email = req.user.email;
    console.log(email)
    if (!currentPass || !newPassword) return res.status(401).json({ success: false, message: 'Missing Details' })
    try {
        const [[user]] = await db.query('select password from users where email = ? ',[email])
        const isMatch = await bcrypt.compare(currentPass,user.password);
       if (!isMatch) return res.status(402).json({success:false,message:'Current Passworld Miss Matching'})
        const hashNewpass= await bcrypt.hash(newPassword,10)

        await db.query('UPDATE users SET password = ? WHERE email = ? ',[hashNewpass,user.email])


        res.status(200).json({success:true,message:'Password Changed'})
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Internal server error' + error })
    }
}
module.exports = { register, login, forgatePass, verifyOTP,changePass }