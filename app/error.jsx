'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Surface the error to whatever monitoring you add later (Sentry, PostHog, etc.)
    console.error('Route error boundary caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border border-stone-200 p-8">
        <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-red-700 mb-3">Something broke</div>
        <h1 className="font-display text-3xl font-light text-stone-900 leading-tight mb-3" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
          Hold on a moment.
        </h1>
        <p className="font-sans text-sm text-stone-700 leading-relaxed mb-6">
          We hit an error rendering this page. The good news: your data is safe — it lives in your account, not this page.
        </p>
        {error?.digest && (
          <div className="bg-stone-50 border border-stone-200 px-3 py-2 mb-6 font-mono text-[11px] text-stone-600">
            Reference: {error.digest}
          </div>
        )}
        <div className="flex gap-2">
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 bg-stone-900 text-stone-50 font-sans text-sm hover:bg-stone-800"
          >
            Try again
          </button>
          <a
            href="/platform"
            className="px-5 py-2.5 border border-stone-300 hover:border-stone-500 font-sans text-sm text-stone-700"
          >
            Back to dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
