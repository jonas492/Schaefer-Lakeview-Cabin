
// Simple availability calculator + mailto builder
const nightly = 185; // CAD — adjust if needed

function nightsBetween(start, end){
  const s = new Date(start), e = new Date(end);
  const ms = e - s;
  if (isNaN(ms) || ms <= 0) return 0;
  return Math.round(ms / (1000*60*60*24));
}

function updateQuote(){
  const inEl = document.querySelector('#checkin');
  const outEl = document.querySelector('#checkout');
  const n = nightsBetween(inEl.value, outEl.value);
  const subtotal = n * nightly;
  const cleaning = n > 0 ? 60 : 0;
  const tax = (subtotal + cleaning) * 0.12;
  const total = subtotal + cleaning + tax;
  document.querySelector('#nights').textContent = n;
  document.querySelector('#est').textContent = total > 0 ? '$' + total.toFixed(2) + ' CAD' : '—';
}

document.addEventListener('input', e => {
  if (e.target.matches('#checkin, #checkout')) updateQuote();
});

document.querySelector('#booking-form').addEventListener('submit', (e)=>{
  e.preventDefault();
  const name = document.querySelector('#name').value.trim();
  const email = document.querySelector('#email').value.trim();
  const inDate = document.querySelector('#checkin').value;
  const outDate = document.querySelector('#checkout').value;
  const guests = document.querySelector('#guests').value;
  const notes = document.querySelector('#notes').value.trim();
  const nights = nightsBetween(inDate, outDate);
  const subject = encodeURIComponent(`Booking request: ${inDate} → ${outDate} (${nights} nights)`);
  const body = encodeURIComponent(
`Hello!

I'd like to request a booking at the cabin.

Name: ${name}
Email: ${email}
Guests: ${guests}
Check-in: ${inDate}
Check-out: ${outDate}
Estimated Nights: ${nights}

Notes:
${notes}

Thanks!`
  );
  // Replace with your email
  window.location.href = `mailto:you@example.com?subject=${subject}&body=${body}`;
});

updateQuote();
