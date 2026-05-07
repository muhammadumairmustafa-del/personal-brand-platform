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
        }
      } catch (e) {
        console.error('storage.set error:', e);
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
  const originalFetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    const url = typeof input === 'string' ? input : input?.url;
    if (url === 'https://api.anthropic.com/v1/messages') {
      return originalFetch('/api/ai', { ...init, credentials: 'include' });
    }
    return originalFetch(input, init);
  };
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
        <div className="w-6 h-6 rounded-full bg-stone-900 text-stone-50 flex items-center justify-center font-mono text-[10px] uppercase">
          {(user?.email || '?').slice(0, 1)}
        </div>
        <span className="font-sans text-xs text-stone-700 hidden sm:inline">{user?.email}</span>
        <button
          onClick={signOut}
          disabled={signingOut}
          className="font-mono text-[10px] uppercase tracking-wider text-stone-500 hover:text-stone-900 ml-1 disabled:opacity-30"
        >
          {signingOut ? '...' : 'Sign out'}
        </button>
      </div>

      <PersonalBrandPlatform />
    </>
  );
}
