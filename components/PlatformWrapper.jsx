'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import PersonalBrandPlatform from './PersonalBrandPlatform';

// Install shims synchronously on first render so the platform's loadData()
// finds window.storage and the fetch() patch already in place.
function installShims() {
  if (typeof window === 'undefined') return;
  if (window.__brandShimsInstalled) return;
  window.__brandShimsInstalled = true;

  const fireToast = (type, message) => {
    try {
      window.dispatchEvent(new CustomEvent('brand-toast', { detail: { type, message } }));
    } catch {}
  };

  // window.storage — proxies to /api/data/[key]
  window.storage = {
    get: async (key) => {
      try {
        const r = await fetch(`/api/data/${encodeURIComponent(key)}`, {
          method: 'GET',
          credentials: 'include'
        });
        if (!r.ok) return { value: null };
        return await r.json();
      } catch {
        return { value: null };
      }
    },
    set: async (key, value) => {
      try {
        const r = await fetch(`/api/data/${encodeURIComponent(key)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ value })
        });
        if (!r.ok) {
          const err = await r.json().catch(() => ({}));
          console.error('storage.set failed:', err);
          fireToast('error', err.error || `Save failed (HTTP ${r.status})`);
        }
      } catch (e) {
        console.error('storage.set error:', e);
        fireToast('error', 'Connection issue — your last change may not have saved.');
      }
    },
    delete: async (key) => {
      try {
        await fetch(`/api/data/${encodeURIComponent(key)}`, {
          method: 'DELETE',
          credentials: 'include'
        });
      } catch (e) {
        console.error('storage.delete error:', e);
      }
    }
  };

  // Patch fetch to redirect Anthropic API calls → our server proxy
  // Also surface errors (rate limits, network, upstream failures) to the user.
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input?.url;
    if (url === 'https://api.anthropic.com/v1/messages') {
      let response;
      try {
        response = await originalFetch('/api/ai', { ...init, credentials: 'include' });
      } catch (e) {
        fireToast('error', 'Network issue calling AI. Try again.');
        throw e;
      }
      if (!response.ok) {
        try {
          const err = await response.clone().json();
          const niceMsg =
            response.status === 429 ? (err.error || 'AI rate limit reached — try again later.') :
            response.status === 401 ? 'Your session expired — please sign in again.' :
            response.status === 502 ? 'AI service is having issues. Try again in a minute.' :
            (err.error || `AI request failed (HTTP ${response.status})`);
          fireToast('error', niceMsg);
        } catch {
          fireToast('error', `AI request failed (HTTP ${response.status})`);
        }
      }
      return response;
    }
    return originalFetch(input, init);
  };
}

// ─── Global Toast Component ──────────────────────────────────────────────
// Listens for `brand-toast` CustomEvents and renders dismissable cards.
function Toaster() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (e) => {
      const { type = 'info', message = '' } = e.detail || {};
      if (!message) return;
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, type, message }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 6000);
    };
    window.addEventListener('brand-toast', handler);
    return () => window.removeEventListener('brand-toast', handler);
  }, []);

  const dismiss = (id) => setToasts((t) => t.filter((x) => x.id !== id));

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => {
        const colors = {
          error: 'bg-red-950 text-red-50 border-red-800',
          success: 'bg-emerald-950 text-emerald-50 border-emerald-800',
          info: 'bg-stone-900 text-stone-50 border-stone-700'
        };
        const Icon = t.type === 'error' ? '⚠' : t.type === 'success' ? '✓' : '·';
        return (
          <div
            key={t.id}
            role="status"
            className={`${colors[t.type] || colors.info} border px-4 py-3 shadow-lg flex items-start gap-3 animate-fade-in`}
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            <span className="font-mono text-sm leading-none mt-0.5">{Icon}</span>
            <span className="text-sm leading-snug flex-1">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="opacity-60 hover:opacity-100 text-sm leading-none px-1"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default function PlatformWrapper({ user }) {
  // Install shims synchronously before children render
  useState(() => { installShims(); });
  const [signingOut, setSigningOut] = useState(false);

  const signOut = async () => {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <>
      {/* Floating account chip — top right */}
      <div className="fixed top-4 right-4 z-[60] flex items-center gap-2 bg-white border border-stone-200 px-3 py-1.5 shadow-sm">
        <div className="w-6 h-6 rounded-full bg-stone-900 text-stone-50 flex items-center justify-center font-mono text-[10px] uppercase" aria-hidden="true">
          {(user?.email || '?').slice(0, 1)}
        </div>
        <span className="font-sans text-xs text-stone-700 hidden sm:inline">{user?.email}</span>
        <button
          onClick={signOut}
          disabled={signingOut}
          aria-label="Sign out"
          className="font-mono text-[10px] uppercase tracking-wider text-stone-500 hover:text-stone-900 ml-1 disabled:opacity-30"
        >
          {signingOut ? '...' : 'Sign out'}
        </button>
      </div>

      <PersonalBrandPlatform />
      <Toaster />
    </>
  );
}
