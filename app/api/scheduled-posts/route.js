import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

async function requireUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  return { supabase, user };
}

// GET /api/scheduled-posts — list pending + recently-posted for this user
export async function GET() {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  const { data, error } = await auth.supabase
    .from('scheduled_posts')
    .select('*')
    .eq('user_id', auth.user.id)
    .order('scheduled_for', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ rows: data || [] });
}

// POST /api/scheduled-posts — enqueue a new post
export async function POST(request) {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

  const platform = String(body.platform || '').toLowerCase().slice(0, 32);
  const content = String(body.content || '').slice(0, 50_000);
  const scheduledFor = body.scheduledFor;
  if (!platform || !content || !scheduledFor) {
    return NextResponse.json({ error: 'platform, content, and scheduledFor are required' }, { status: 400 });
  }
  const ts = new Date(scheduledFor);
  if (isNaN(ts.getTime())) return NextResponse.json({ error: 'Invalid scheduledFor' }, { status: 400 });

  const { data, error } = await auth.supabase
    .from('scheduled_posts')
    .insert({
      user_id: auth.user.id,
      platform,
      content,
      metadata: body.metadata || null,
      scheduled_for: ts.toISOString(),
      status: 'pending',
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ row: data });
}

// DELETE /api/scheduled-posts?id=<n>
export async function DELETE(request) {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const { error } = await auth.supabase
    .from('scheduled_posts')
    .delete()
    .eq('user_id', auth.user.id)
    .eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
