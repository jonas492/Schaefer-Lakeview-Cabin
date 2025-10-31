
import { getStore } from '@netlify/blobs';
function overlaps(aStart,aEnd,bStart,bEnd){ return (aStart < bEnd) && (bStart < aEnd); }
function iso(d){ return new Date(d).toISOString().slice(0,10); }
function uid(){ return crypto.randomUUID(); }
function token(){ return Array.from(crypto.getRandomValues(new Uint8Array(24))).map(b=>b.toString(16).padStart(2,'0')).join(''); }
export const handler = async (event) => {
  if (event.httpMethod!=='POST') return { statusCode:405, body:'Method Not Allowed' };
  try{
    const { start, end, name, email, guests, notes } = JSON.parse(event.body||'{}');
    if (!start||!end||!name||!email) return { statusCode:400, body: JSON.stringify({ success:false, message:'Missing fields' }) };
    const s=new Date(start+'T12:00:00'), e=new Date(end+'T12:00:00'); if(!(s<e)) return { statusCode:400, body: JSON.stringify({ success:false, message:'Invalid date range' }) };
    const store=getStore('cabin'), key='bookings.json'; const cur=await store.get(key,{type:'json'})||{bookings:[]};
    const conflict=(cur.bookings||[]).some(b=>b.status==='confirmed' && overlaps(new Date(b.start), new Date(b.end), s, e));
    if (conflict) return { statusCode:409, body: JSON.stringify({ success:false, message:'Those dates are no longer available.' }) };
    const id=uid(), cancel_token=token();
    const rec={ id, start:iso(s), end:iso(e), name, email, guests:guests||'', notes:notes||'', status:'confirmed', createdAt:new Date().toISOString(), cancel_token };
    const updated={ bookings:[rec, ...(cur.bookings||[])] };
    await store.set(key, JSON.stringify(updated), { consistent:true });
    const RESEND_API_KEY=process.env.RESEND_API_KEY, FROM_EMAIL=process.env.FROM_EMAIL||'Cabin <noreply@example.com>', OWNER_EMAIL=process.env.OWNER_EMAIL||FROM_EMAIL, SITE_BASE_URL=process.env.SITE_BASE_URL||`https://${event.headers.host}`;
    const cancelUrl=`${SITE_BASE_URL}/.netlify/functions/cancel?id=${encodeURIComponent(id)}&token=${encodeURIComponent(cancel_token)}`;
    const subject=`Booking confirmed: ${rec.start} → ${rec.end} (${name})`;
    const text=`Hi ${name},\n\nYour booking is confirmed.\n\nDates: ${rec.start} to ${rec.end}\nGuests: ${rec.guests || '-'}\n\nCancel anytime:\n${cancelUrl}\n`; const html=`<p>Hi ${name},</p><p><strong>Your booking is confirmed.</strong></p><p>Dates: <strong>${rec.start}</strong> to <strong>${rec.end}</strong><br/>Guests: ${rec.guests||'-'}</p><p>Cancel anytime: <a href="${cancelUrl}">${cancelUrl}</a></p>`;
    if (RESEND_API_KEY){
      const send = (to, subj, text, html)=> fetch('https://api.resend.com/emails',{method:'POST', headers:{'Authorization':`Bearer ${RESEND_API_KEY}`,'Content-Type':'application/json'}, body: JSON.stringify({from:FROM_EMAIL,to,subject:subj,text,html})});
      await Promise.all([ send(email, subject, text, html), send(OWNER_EMAIL, `New booking: ${rec.start} → ${rec.end} (${name})`, `New booking by ${name} <${email}>`, `<p>New booking by ${name} &lt;${email}&gt;</p><p>${rec.start} → ${rec.end}</p>`) ]);
    }
    return { statusCode:200, headers:{'Content-Type':'application/json','Cache-Control':'no-store'}, body: JSON.stringify({ success:true, id, start:rec.start, end:rec.end }) };
  }catch(e){ return { statusCode:500, body: JSON.stringify({ success:false, message:'Server error' }) }; }
};
