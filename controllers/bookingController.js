const db = require("../config/db");
// booking
const bookflight = async (req, res) => {
    const id = req.user.user_id;
    if (!id) return res.json({ success: false, message: 'user not login' });
    const { passengerName, age, passengerEmail, jurneyDate, address, flght_no, flightClass } = req.body;
    if (!passengerName || !passengerEmail || !address || !age || !jurneyDate || !flght_no || !flightClass) {
        return res.status(404).json({ success: false, message: 'Missing details' })
    }

    // generating ticket number
    function GenerateTicketNumber() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    try {
        // checking seat availability
        const [flights] = await db.query("SELECT * FROM flights where flight_no = ?", [flght_no])
        if (!flights || flights.length === 0) {
            return res.status(401).json({ success: false, message: 'Flight Not Available' })
        }
        const flight = flights[0];

        // check seat availability
        let SeatAvailbility = 0;
        let bookedSeat = 0;
        if (flightClass == 'economy') {
            SeatAvailbility = flight.total_seats_economy - flight.booked_seats_economy;
            bookedSeat = flight.booked_seats_economy;
        }
        else if (flightClass === 'business') {
            SeatAvailbility = flight.total_seats_business - flight.booked_seats_business;
            bookedSeat = flight.booked_seats_business;
        }
        else if (flightClass === 'first') {
            SeatAvailbility = flight.total_seats_first - flight.booked_seats_first;
            bookedSeat = flight.booked_seats_first;
        }
        else {
            return res.status(404).json({ success: false, message: 'Invalid Class' })
        }
        if (SeatAvailbility <= 0) {
            return res.status(404).json({ success: false, message: 'No Seats Available in ' + flightClass + ' Class' })
        }
        const query = 'INSERT INTO bookings (user_id, flight_no, flight_id, seat_no, passenger_name, age,address , email, class) VALUES (?, ?, ?, ?, ?, ?, ?,? , ?)'
        const bookResult = await db.query(query, [
            id,             // user_id INT
            flght_no,       // flight_no VARCHAR
            flight.flight_id,       // flight_id INT
            bookedSeat + 1,         // seat_no INT or VARCHAR
            passengerName,  // passenger_name VARCHAR
            parseInt(age),
            address,  // age INT
            passengerEmail, // email VARCHAR
            flightClass     // class VARCHAR
        ]);
        if (bookResult[0].affectedRows === 0) return res.status(303).json({ success: false, message: "Booking Failed" })
        // update booked seats
        await db.query(`update flights set booked_seats_${flightClass} = ? where flight_no = ?  `, [bookedSeat + 1, flght_no]);
        const ticket_number = GenerateTicketNumber();
        await db.query(`INSERT INTO TICKETS (booking_id, ticket_number,flight_no ,source, destination, journey_date, seat_no, class) values (?, ?, ?, ?, ?, ?, ?,?)`, [bookResult[0].insertId, ticket_number, flght_no, flight.source, flight.destination, jurneyDate, bookedSeat + 1, flightClass,])
        res.status(200).json({ success: true, message: 'Reservation Booked Successfully', PNR: ticket_number })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' + error })
    }
};
// ticket details
const ticketView = async (req, res) => {
    const { ticket_number } = req.body;
    if (!ticket_number) return res.status(404).json({ success: false, message: 'Enter Ticket Number' }

    )
    try {
        const [ticket] = await db.query('SELECT * FROM tickets WHERE ticket_number=?', [ticket_number]);
        if (ticket.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Ticket Not Found'
            });
        }
        res.status(200).json({
            success: true,
            ticket: ticket[0]
        })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' + error })
    }
}
//
const cancel = async (req, res) => {
    const { ticket_number } = req.body;
    const user_id = req.user.user_id;
    if (!ticket_number) return res.status(200).json({
        success: false,
        message: 'Ticket Number Not Found'
    });

    try {
        const isMatch = await db.query('select user_id from bookings where user_id and  = ? ', [user_id]);
        console.log(isMatch)

        //    if (condition) {

        //    } else {

        //    }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' + error })
    }

}
module.exports = { bookflight, ticketView, cancel }