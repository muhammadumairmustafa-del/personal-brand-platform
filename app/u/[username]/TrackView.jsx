'use client';

import { useEffect } from 'react';

// Fires a single fire-and-forget tracking beacon when the public profile mounts.
// Uses sendBeacon when available so the request survives page unload.
export default function TrackView({ username }) {
  useEffect(() => {
    if (!username || typeof window === 'undefined') return;
    const payload = JSON.stringify({
      username,
      referrer: document.referrer || '',
      path: window.location.pathname,
    });
    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon('/api/track', blob);
      } else {
        fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true }).catch(() => {});
      }
    } catch {}
  }, [username]);

  return null;
}
