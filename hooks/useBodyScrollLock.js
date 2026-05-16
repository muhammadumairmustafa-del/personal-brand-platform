import { useEffect } from 'react';

// useBodyScrollLock — lock body scroll while a modal/drawer is open.
export function useBodyScrollLock(locked) {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (locked) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [locked]);
}
