import { useEffect } from 'react';

// useEscape — call onEscape when user presses ESC. Idempotent.
export function useEscape(onEscape) {
  useEffect(() => {
    if (typeof window === 'undefined' || !onEscape) return;
    const handler = (e) => { if (e.key === 'Escape') onEscape(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onEscape]);
}
