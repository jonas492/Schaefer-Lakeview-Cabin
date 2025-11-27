# Schaefers Lakeview Cottage Booking Site

Modern, mobile-friendly React + Node.js site for receiving, confirming, and managing bookings.

## Quick Start

**Backend**

1. Go to `server/`
2. Copy `.env.example` to `.env`, fill in your SMTP info (use Gmail/other SMTP)
3. Install dependencies:
   ```
   npm install
   npm start
   ```
   - Server runs on port 4000

**Frontend**

1. Go to `client/`
2. Install dependencies:
   ```
   npm install
   npm start
   ```
   - Runs on port 3000

**Images**

- Place your images in `client/public/images/` named:
  - beach.jpg
  - cottage.jpg
  - sunset-dock.jpg
  - hiking.jpg
- Add more by updating `IMAGES` array in `App.js`

## Features

- Photo gallery, amenities list, modern design (blue/grey)
- Interactive calendar (blocked dates auto)
- Booking form (dates, guest info, special requests)
- Email notification to owner (`Viktor@vssolutions.ca`)
- Confirmation email to guest (with payment instructions)
- All bookings reserve the dates immediately
- No login/payment integration (e-transfers)

## Deployment

- **Frontend:** GitHub Pages or Vercel
- **Backend:** Render, Vercel, Fly.io, etc.

---

Want to change info or colors? Just update `App.js`, amenities, emails, or styles.
More images or advanced features can be added any time!

Enjoy!