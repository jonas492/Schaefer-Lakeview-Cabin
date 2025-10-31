
import { getStore } from '@netlify/blobs';
export const handler = async () => {
  try {
    const store = getStore('cabin');
    const data = await store.get('bookings.json', { type: 'json' }) || { bookings: [] };
    return { statusCode: 200, headers:{'Content-Type':'application/json','Cache-Control':'no-cache'}, body: JSON.stringify({ bookings: data.bookings||[] }) };
  } catch(e){ return { statusCode:500, body: JSON.stringify({ error:'Failed to load availability' }) }; }
};
