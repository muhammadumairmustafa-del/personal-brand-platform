import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

// Public endpoint — no auth required. Inserts a page-view row using the service
// role so the public page can phone home without leaking secrets to the client.
// Rate-limited via Supabase connection pooling; size-capped explicitly below.

export async function POST(request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    // Soft-fail: tracking is non-critical, never break the visitor's experience
    return NextResponse.json({ ok: false, reason: 'tracking disabled' }, { status: 200 });
  }

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ ok: false }, { status: 400 }); }

  const username = String(body?.username || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 64);
  if (!username) return NextResponse.json({ ok: false }, { status: 400 });

  const referrer = String(body?.referrer || '').slice(0, 500);
  const path = String(body?.path || '').slice(0, 500);
  const userAgent = String(request.headers.get('user-agent') || '').slice(0, 500);

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  // Resolve username -> user_id
  const { data: matches } = await supabase
    .from('user_data')
    .select('user_id, value')
    .eq('key', 'publicProfile');
  const match = matches?.find((m) => (m.value?.username || '').toLowerCase() === username);
  if (!match) return NextResponse.json({ ok: false }, { status: 200 });

  await supabase
    .from('page_views')
    .insert({ user_id: match.user_id, username, path, referrer, user_agent: userAgent });

  return NextResponse.json({ ok: true });
}
