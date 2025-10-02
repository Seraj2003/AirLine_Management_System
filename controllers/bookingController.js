const db = require("../config/db");

const bookflight = async (req, res) => {
    const id = req.user.user_id;

    console.log(id)
    if (!id) return res.json({ success: false, message: 'user not login' });
    const { passengerName, age, passengerEmail, jurneyDate, address, flght_no, flightClass } = req.body;
    if (!passengerName || !passengerEmail || !address || !age || !jurneyDate || !flght_no || !flightClass) {
        return res.status(404).json({ success: false, message: 'Missing details' })
    }
    try {
        // checking seat availability
        const flight = await db.query("SELECT * FROM flights where flight_no = ?", [flght_no])
        console.log(flight)
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Internal server error' + error })
    }
}
module.exports = { bookflight }