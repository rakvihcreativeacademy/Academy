'use client';
import { useEffect, useState } from 'react';

/** Live Bengaluru time for the admin control-room bar. */
export default function AdminClock() {
  const [now, setNow] = useState('');
  useEffect(() => {
    const f = new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' });
    const tick = () => setNow(f.format(new Date()));
    tick(); const id = window.setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="al2-clock" suppressHydrationWarning>{now || '--:--:--'} <small>IST</small></span>;
}
