import { useEffect } from 'react';

// useDocTitle — set <title> for the current view.
export function useDocTitle(title) {
  useEffect(() => {
    if (typeof document === 'undefined' || !title) return;
    const prev = document.title;
    document.title = `${title} · Brand OS`;
    return () => { document.title = prev; };
  }, [title]);
}
