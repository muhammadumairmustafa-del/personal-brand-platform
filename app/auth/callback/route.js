import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Allowlist of safe in-app paths the OAuth callback can redirect to.
// We never accept arbitrary `next` values — that would be an open redirect
// vector (e.g. `?next=//evil.com`).
const SAFE_PATHS = new Set([
  '/platform',
  '/login',
  '/'
]);

function safeNext(raw) {
  if (!raw) return '/platform';
  // Reject anything that doesn't start with a single '/' — that catches
  // '//evil.com' (protocol-relative) and 'https://evil.com' (absolute).
  if (!/^\/[^/]/.test(raw)) return '/platform';
  // Allow our known paths or any /platform/... sub-path or /u/... public path.
  if (SAFE_PATHS.has(raw)) return raw;
  if (raw.startsWith('/platform/')) return raw;
  if (raw.startsWith('/u/')) return raw;
  return '/platform';
}

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = safeNext(searchParams.get('next'));

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
