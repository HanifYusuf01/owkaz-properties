import { useEffect, useState } from 'react';

const dateFormatter = new Intl.DateTimeFormat('en-NG', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Africa/Lagos',
});

const timeFormatter = new Intl.DateTimeFormat('en-NG', {
  hour: 'numeric',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
  timeZone: 'Africa/Lagos',
});

export const FooterClock = () => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg bg-white/5 border border-white/10">
      <span className="text-lg leading-none" aria-hidden>🇳🇬</span>
      <div className="leading-tight">
        <div className="text-xs text-white/70">{dateFormatter.format(now)}</div>
        <div className="text-xs font-semibold text-white tabular-nums">{timeFormatter.format(now)} WAT</div>
      </div>
    </div>
  );
};
