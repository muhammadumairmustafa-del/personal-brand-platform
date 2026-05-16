// Tiny pagination helper. On mobile, cap visible items at MOBILE_LIST_PAGE
// and reveal more in chunks. On desktop, return the full array.

import { useEffect, useState, useMemo } from 'react';
import { MOBILE_LIST_PAGE } from './config';

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 1024px)');
    const sync = () => setMobile(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);
  return mobile;
}

export function usePaginatedList(items) {
  const mobile = useIsMobile();
  const [pages, setPages] = useState(1);

  // Reset to first page whenever the underlying list shrinks or the user switches filter
  useEffect(() => { setPages(1); }, [items?.length]);

  const visible = useMemo(() => {
    if (!mobile) return items || [];
    return (items || []).slice(0, pages * MOBILE_LIST_PAGE);
  }, [items, mobile, pages]);

  const total = (items || []).length;
  const hasMore = mobile && visible.length < total;
  return { visible, hasMore, total, loadMore: () => setPages((p) => p + 1), reset: () => setPages(1) };
}
