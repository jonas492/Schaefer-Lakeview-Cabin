const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const BOOKINGS_FILE = './bookings.json';
const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Utility
function loadBookings() {
  if (!fs.existsSync(BOOKINGS_FILE)) return [];
  return JSON.parse(fs.readFileSync(BOOKINGS_FILE));
}
function saveBookings(bookings) {
  fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// GET bookings
app.get('/api/bookings', (req, res) => {
  return res.json(loadBookings());
});

// POST book
app.post('/api/book', (req, res) => {
  const { name, email, phone, guests, message, start, end } = req.body;
  if (!name || !email || !guests || !start || !end) {
    return res.status(400).json({ error: 'Missing information.' });
  }

  // Overlap check
  const bookings = loadBookings();
  const requestedStart = new Date(start);
  const requestedEnd = new Date(end);
  const overlap = bookings.some(b =>
    requestedStart <= new Date(b.end) && requestedEnd >= new Date(b.start)
  );
  if (overlap) {
    return res.status(409).json({ error: 'Selected dates are unavailable.' });
  }

  const newBooking = { name, email, phone, guests, message, start, end };
  bookings.push(newBooking);
  saveBookings(bookings);

  // Owner email
  const ownerMailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: 'Viktor@vssolutions.ca',
    subject: `New Booking - Schaefers Lakeview Cottage`,
    text: `
New booking request:

Name: ${name}
Email: ${email}
Phone: ${phone}
Guests: ${guests}
Dates: ${start} to ${end}
Special Requests: ${message || 'None'}

Booking is now reserved. Please follow up for payment.
    `
  };
  transporter.sendMail(ownerMailOptions, () => {});

  // Guest confirmation email
  const guestMailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: 'Booking Confirmation - Schaefers Lakeview Cottage',
    text: `
Hello ${name},

Thank you for booking Schaefers Lakeview Cottage!

Your reservation details:
- Dates: ${start} to ${end}
- Number of guests: ${guests}

Please send your e-transfer payment to Viktor@vssolutions.ca to secure your stay.
We will contact you soon with further details and check-in instructions.

If you have any questions, reply to this email.

We look forward to welcoming you!

Sincerely,
Schaefers Lakeview Cottage
46 Sunset Drive, Lac du Bonet MB
    `
  };
  transporter.sendMail(guestMailOptions, () => {});

  return res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Cabin booking server running on port ${PORT}`);
});