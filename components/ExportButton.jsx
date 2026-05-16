'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';

export default function ExportButton({ className = '' }) {
  const [busy, setBusy] = useState(false);

  const download = async () => {
    setBusy(true);
    try {
      const r = await fetch('/api/export', { credentials: 'include' });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `brand-os-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      window.dispatchEvent(new CustomEvent('brand-toast', {
        detail: { type: 'success', message: 'Export downloaded. Keep that file safe.' }
      }));
    } catch (e) {
      console.error('Export failed:', e);
      window.dispatchEvent(new CustomEvent('brand-toast', {
        detail: { type: 'error', message: `Export failed: ${e.message || 'unknown error'}` }
      }));
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={download}
      disabled={busy}
      className={className || 'px-4 py-2 border border-stone-300 hover:border-stone-500 text-sm text-stone-800 inline-flex items-center gap-2 disabled:opacity-50'}
    >
      <Download className="w-4 h-4" />
      {busy ? 'Preparing…' : 'Download all data (JSON)'}
    </button>
  );
}
