'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [mode, setMode] = useState('signin'); // signin | signup | magiclink
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const router = useRouter();
  const supabase = createClient();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (mode === 'magiclink') {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        });
        if (error) throw error;
        setMessage({ type: 'success', text: 'Check your email for the magic link.' });
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        });
        if (error) throw error;
        setMessage({ type: 'success', text: 'Check your email to confirm your account.' });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/platform');
        router.refresh();
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    if (error) {
      setMessage({ type: 'error', text: error.message });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-100 rounded-full blur-3xl opacity-40 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-stone-200 rounded-full blur-3xl opacity-50 pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="mb-10 text-center">
          <div className="font-mono text-[10px] tracking-[0.3em] text-stone-500 uppercase mb-3">Brand OS</div>
          <h1 className="font-display text-5xl font-light text-stone-900 leading-[1.05] tracking-tight">
            Welcome<span className="text-stone-400">.</span>
          </h1>
          <p className="font-sans text-sm text-stone-600 mt-3">
            {mode === 'signup' ? 'Create an account to start building.' : mode === 'magiclink' ? 'We\'ll email you a one-time link.' : 'Sign in to your brand workspace.'}
          </p>
        </div>

        <div className="bg-white border border-stone-200 p-8 shadow-[0_2px_30px_rgba(0,0,0,0.04)]">
          <button
            onClick={signInWithGoogle}
            disabled={loading}
            className="w-full px-4 py-3 border border-stone-300 hover:border-stone-500 font-sans text-sm flex items-center justify-center gap-3 mb-5 disabled:opacity-30"
          >
            <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-stone-200" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-stone-500">or</span>
            <div className="flex-1 h-px bg-stone-200" />
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block font-mono text-[10px] tracking-[0.15em] uppercase text-stone-500 mb-2">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-300 focus:border-stone-900 outline-none font-sans text-stone-900"
                placeholder="you@example.com"
              />
            </div>
            {mode !== 'magiclink' && (
              <div>
                <label className="block font-mono text-[10px] tracking-[0.15em] uppercase text-stone-500 mb-2">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-300 focus:border-stone-900 outline-none font-sans text-stone-900"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-stone-900 text-stone-50 font-sans text-sm hover:bg-stone-800 disabled:opacity-30"
            >
              {loading ? 'Working...' : mode === 'signup' ? 'Create account' : mode === 'magiclink' ? 'Send magic link' : 'Sign in'}
            </button>
          </form>

          {message && (
            <div className={`mt-4 p-3 text-sm font-sans ${message.type === 'error' ? 'bg-red-50 border border-red-200 text-red-800' : 'bg-emerald-50 border border-emerald-200 text-emerald-800'}`}>
              {message.text}
            </div>
          )}

          <div className="mt-5 text-center font-sans text-xs text-stone-600 space-x-3">
            {mode === 'signin' && (
              <>
                <button onClick={() => setMode('signup')} className="hover:text-stone-900 underline">Create account</button>
                <span className="text-stone-300">·</span>
                <button onClick={() => setMode('magiclink')} className="hover:text-stone-900 underline">Use magic link</button>
              </>
            )}
            {mode === 'signup' && (
              <button onClick={() => setMode('signin')} className="hover:text-stone-900 underline">Already have an account? Sign in</button>
            )}
            {mode === 'magiclink' && (
              <button onClick={() => setMode('signin')} className="hover:text-stone-900 underline">Back to password sign in</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
