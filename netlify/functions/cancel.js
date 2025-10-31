
import { getStore } from '@netlify/blobs';
export const handler = async (event) => {
  try{
    const p=event.queryStringParameters||{}; const id=p.id, token=p.token;
    if(!id||!token) return { statusCode:400, body:'Missing id or token' };
    const store=getStore('cabin'), key='bookings.json'; const data=await store.get(key,{type:'json'})||{bookings:[]};
    const i=(data.bookings||[]).findIndex(b=>b.id===id && b.cancel_token===token && b.status==='confirmed');
    if (i===-1) return { statusCode:400, body:'Invalid or already cancelled link' };
    data.bookings[i].status='cancelled'; data.bookings[i].cancelledAt=new Date().toISOString();
    await store.set(key, JSON.stringify(data), { consistent:true });
    const RESEND_API_KEY=process.env.RESEND_API_KEY, FROM_EMAIL=process.env.FROM_EMAIL||'Cabin <noreply@example.com>', OWNER_EMAIL=process.env.OWNER_EMAIL||FROM_EMAIL, SITE_BASE_URL=process.env.SITE_BASE_URL||`https://${event.headers.host}`;
    const guest=data.bookings[i].email, name=data.bookings[i].name, dates=`${data.bookings[i].start} → ${data.bookings[i].end}`;
    if (RESEND_API_KEY){
      const send=(to,subject,text,html)=> fetch('https://api.resend.com/emails',{method:'POST',headers:{'Authorization':`Bearer ${RESEND_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({from:FROM_EMAIL,to,subject,text,html})});
      await Promise.all([
        send(guest, `Booking cancelled: ${dates}`, `Hi ${name},\n\nYour booking (${dates}) has been cancelled.\n`, `<p>Hi ${name},</p><p>Your booking <strong>${dates}</strong> has been cancelled.</p>`),
        send(OWNER_EMAIL, `Booking cancelled: ${dates}`, `Cancelled by ${name} <${guest}>`, `<p>Cancelled by ${name} &lt;${guest}&gt;</p><p>${dates}</p>`)
      ]);
    }
    return { statusCode:302, headers:{ Location: `${SITE_BASE_URL}/?cancelled=1` } };
  }catch(e){ return { statusCode:500, body:'Server error' }; }
};
