import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

async function requireUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  return { supabase, user };
}

// GET /api/post-performance — list recent records for the current user
export async function GET() {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  const { data, error } = await auth.supabase
    .from('post_performance')
    .select('*')
    .eq('user_id', auth.user.id)
    .order('recorded_at', { ascending: false })
    .limit(200);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ rows: data || [] });
}

// POST /api/post-performance — record engagement on a published post
export async function POST(request) {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

  const num = (v) => {
    const n = parseInt(v, 10);
    return isNaN(n) || n < 0 ? null : Math.min(n, 100_000_000);
  };

  const row = {
    user_id: auth.user.id,
    content_id: body.contentId ? String(body.contentId).slice(0, 64) : null,
    platform: body.platform ? String(body.platform).slice(0, 32) : null,
    url: body.url ? String(body.url).slice(0, 500) : null,
    hook: body.hook ? String(body.hook).slice(0, 500) : null,
    impressions: num(body.impressions),
    likes: num(body.likes),
    comments: num(body.comments),
    shares: num(body.shares),
    dms: num(body.dms),
    posted_at: body.postedAt || null,
  };

  const { data, error } = await auth.supabase
    .from('post_performance')
    .insert(row)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ row: data });
}

// DELETE /api/post-performance?id=<n>
export async function DELETE(request) {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const { error } = await auth.supabase
    .from('post_performance')
    .delete()
    .eq('user_id', auth.user.id)
    .eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
