'use client';

export default function LoadMoreFooter({ visible, total, hasMore, onLoadMore, label = 'items' }) {
  if (!hasMore && total <= visible) return null;
  return (
    <div className="mt-6 flex flex-col items-center gap-2">
      <div className="font-mono text-[10px] uppercase tracking-wider text-stone-500">
        Showing {visible} of {total} {label}
      </div>
      {hasMore && (
        <button
          onClick={onLoadMore}
          className="px-5 py-2 border border-stone-300 hover:border-stone-500 text-sm text-stone-700"
        >
          Load more
        </button>
      )}
    </div>
  );
}
