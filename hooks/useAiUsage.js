import { useEffect, useState } from 'react';
import { AI_HOUR_LIMIT, AI_DAY_LIMIT } from '@/lib/config';

// useAiUsage — fetch and refresh the rate-limit counter from storage.
// Auto-refreshes after every "brand-ai-call" event (dispatched by the fetch shim).
export function useAiUsage() {
  const [usage, setUsage] = useState({ hourCount: 0, dayCount: 0, loaded: false });

  const refresh = async () => {
    try {
      if (typeof window === 'undefined' || !window.storage) return;
      const r = await window.storage.get('_aiUsage');
      const parsed = r?.value ? JSON.parse(r.value) : {};
      const now = Date.now();
      const inHour = (now - (parsed.hourStart || 0)) < 60 * 60 * 1000;
      const inDay = (now - (parsed.dayStart || 0)) < 24 * 60 * 60 * 1000;
      setUsage({
        hourCount: inHour ? (parsed.hourCount || 0) : 0,
        dayCount: inDay ? (parsed.dayCount || 0) : 0,
        loaded: true,
      });
    } catch {
      setUsage((u) => ({ ...u, loaded: true }));
    }
  };

  useEffect(() => {
    refresh();
    const onAi = () => { setTimeout(refresh, 300); };
    if (typeof window !== 'undefined') {
      window.addEventListener('brand-ai-call', onAi);
      return () => window.removeEventListener('brand-ai-call', onAi);
    }
  }, []);

  return { ...usage, hourLimit: AI_HOUR_LIMIT, dayLimit: AI_DAY_LIMIT, refresh };
}
