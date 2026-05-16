'use client';

import { useEffect, useState } from 'react';
import { Clock, Repeat } from 'lucide-react';

// Reads `_history:<key>` (a single rolling snapshot, written by /api/data/[key] PUT)
// and lets the user restore it. Reusable across views that save full JSON blobs.
export default function VersionHistoryDropdown({ storageKey, onRestore, label = 'Version history' }) {
  const [open, setOpen] = useState(false);
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || snapshot) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const r = await window.storage.get(`_history:${storageKey}`);
        const parsed = r?.value ? JSON.parse(r.value) : null;
        if (!cancelled) setSnapshot(parsed);
      } catch (e) {
        console.error('History fetch failed', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [open, snapshot, storageKey]);

  const restore = async () => {
    if (!snapshot?.snapshot) return;
    const ok = await (window.brandConfirm ? window.brandConfirm('Restore the previous version? Your current data will be replaced.') : Promise.resolve(window.confirm('Restore the previous version?')));
    if (!ok) return;
    onRestore(snapshot.snapshot);
    setOpen(false);
    window.dispatchEvent(new CustomEvent('brand-toast', {
      detail: { type: 'success', message: 'Restored from last snapshot.' }
    }));
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        className="px-3 py-1.5 border border-stone-300 hover:border-stone-500 text-xs text-stone-700 inline-flex items-center gap-1.5"
      >
        <Clock className="w-3.5 h-3.5" />
        {label}
      </button>
      {open && (
        <div className="absolute right-0 mt-1 z-50 w-72 bg-white border border-stone-200 shadow-lg p-4" style={{ fontFamily: "'Inter', sans-serif" }}>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-2">Last saved snapshot</div>
          {loading && <div className="text-xs text-stone-500 italic">Loading…</div>}
          {!loading && !snapshot && <div className="text-xs text-stone-500 italic">No snapshot yet. Snapshots are created on save.</div>}
          {!loading && snapshot && (
            <>
              <div className="text-sm text-stone-700 mb-3">
                Saved {new Date(snapshot.savedAt).toLocaleString()}
              </div>
              <button
                onClick={restore}
                className="w-full px-3 py-2 bg-amber-700 text-amber-50 text-xs hover:bg-amber-800 inline-flex items-center justify-center gap-1.5"
              >
                <Repeat className="w-3.5 h-3.5" />
                Restore this version
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
