import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAdapter } from '@/lib/publishAdapters';

export const runtime = 'nodejs';
export const maxDuration = 60;

// Vercel Cron hits this endpoint. Authenticated via the `CRON_SECRET` env var
// (Vercel injects `Authorization: Bearer <secret>` automatically when you set
// CRON_SECRET in project settings).
//
// On each tick: pick up to 25 pending posts whose scheduled_for <= now, run
// the matching adapter, mark posted/failed.

const MAX_BATCH = 25;
const MAX_ATTEMPTS = 5;

function isAuthorized(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get('authorization') || '';
  return auth === `Bearer ${secret}`;
}

export async function GET(request) {
  if (!isAuthorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return NextResponse.json({ error: 'Service role not configured' }, { status: 500 });

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const now = new Date().toISOString();
  const { data: queue, error } = await supabase
    .from('scheduled_posts')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_for', now)
    .order('scheduled_for', { ascending: true })
    .limit(MAX_BATCH);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const results = [];
  for (const post of queue || []) {
    const adapter = getAdapter(post.platform);
    let outcome;
    try {
      outcome = await adapter({
        userId: post.user_id,
        content: post.content,
        metadata: post.metadata || {},
      });
    } catch (e) {
      outcome = { ok: false, error: String(e?.message || e) };
    }

    const attempts = (post.attempts || 0) + 1;
    if (outcome.ok) {
      await supabase
        .from('scheduled_posts')
        .update({ status: 'posted', posted_at: new Date().toISOString(), attempts, last_error: null })
        .eq('id', post.id);
    } else if (attempts >= MAX_ATTEMPTS) {
      await supabase
        .from('scheduled_posts')
        .update({ status: 'failed', attempts, last_error: outcome.error?.slice(0, 500) || 'unknown' })
        .eq('id', post.id);
    } else {
      await supabase
        .from('scheduled_posts')
        .update({ attempts, last_error: outcome.error?.slice(0, 500) || 'unknown' })
        .eq('id', post.id);
    }

    results.push({ id: post.id, ok: outcome.ok, platform: post.platform });
  }

  return NextResponse.json({ processed: results.length, results });
}
