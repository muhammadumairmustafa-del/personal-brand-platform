'use client';

import { useEffect, useState } from 'react';

// Subscribes to `brand-save` events from window.storage.set and renders
// "Saving..." / "Saved Xs ago" / "Save failed" — small enough to live in the top chrome.
export default function SaveStatus() {
  const [status, setStatus] = useState('idle');
  const [savedAt, setSavedAt] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const onSave = (e) => {
      const s = e.detail?.status;
      if (!s) return;
      setStatus(s);
      if (s === 'saved') setSavedAt(e.detail.at || Date.now());
    };
    window.addEventListener('brand-save', onSave);
    return () => window.removeEventListener('brand-save', onSave);
  }, []);

  // Tick every 15s so the "Saved Xm ago" string stays fresh
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 15000);
    return () => clearInterval(t);
  }, []);

  if (status === 'idle' && !savedAt) return null;

  const ago = savedAt ? Date.now() - savedAt : 0;
  const agoStr = ago < 5000 ? 'just now' : ago < 60000 ? `${Math.round(ago / 1000)}s ago` : ago < 3600000 ? `${Math.round(ago / 60000)}m ago` : 'a while ago';

  let label, tone;
  if (status === 'saving') { label = 'Saving…'; tone = 'text-stone-500'; }
  else if (status === 'error') { label = 'Save failed'; tone = 'text-red-600'; }
  else if (status === 'saved') { label = `Saved ${agoStr}`; tone = 'text-stone-500'; }
  else if (savedAt) { label = `Saved ${agoStr}`; tone = 'text-stone-500'; }
  else return null;

  // Keep tick referenced so the linter doesn't strip it
  void tick;

  return (
    <div
      className={`font-mono text-[10px] uppercase tracking-wider ${tone}`}
      title={savedAt ? new Date(savedAt).toLocaleString() : ''}
      aria-live="polite"
    >
      {label}
    </div>
  );
}
