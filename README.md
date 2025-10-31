# Cabin Booking Add‑On (Netlify Functions + Blobs)

Drop these files into your repository to add a **real, live availability calendar** with instant updates, email confirmation, and one‑click cancellation.

## Requirements
Set these in Netlify → Site settings → Build & deploy → Environment:
- `RESEND_API_KEY` — your transactional email key (from https://resend.com)
- `FROM_EMAIL` — e.g. `Cabin <bookings@yourdomain.com>`
- `OWNER_EMAIL` — where to notify you
- `SITE_BASE_URL` — e.g. `https://lakeview-cabin.netlify.app`

## Install
1) Copy `assets/`, `netlify/`, and `netlify.toml` into your repo (next to `index.html`).
2) Add this to your `index.html` where you want the calendar:
```html
<section id="availability">
  <div class="container">
    <div class="card">
      <h2 class="h2">Availability</h2>
      <div id="booking-widget"></div>
      <script defer src="assets/availability.js"></script>
    </div>
  </div>
</section>
```
3) Commit & push. Netlify redeploys automatically.
