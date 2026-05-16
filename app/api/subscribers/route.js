import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { randomBytes } from 'crypto';
import { validate, emailSchema } from '@/lib/validators';

export const runtime = 'nodejs';

async function requireUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  return { supabase, user };
}

// GET /api/subscribers — list owner's subscribers
export async function GET() {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  const { data, error } = await auth.supabase
    .from('subscribers')
    .select('id, email, name, source, confirmed_at, unsubscribed_at, created_at')
    .eq('owner_id', auth.user.id)
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const total = data?.length || 0;
  const confirmed = (data || []).filter((s) => s.confirmed_at && !s.unsubscribed_at).length;
  return NextResponse.json({ rows: data || [], total, confirmed });
}

// POST /api/subscribers — add one or many subscribers (with double-opt-in token)
export async function POST(request) {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

  // Accept single or batch
  const items = Array.isArray(body.subscribers) ? body.subscribers : [body];
  if (items.length === 0) return NextResponse.json({ error: 'No items' }, { status: 400 });
  if (items.length > 1000) return NextResponse.json({ error: 'Too many at once (max 1000)' }, { status: 400 });

  const accepted = [];
  const rejected = [];
  for (const it of items) {
    const check = validate(emailSchema, it?.email || '');
    if (!check.ok) {
      rejected.push({ email: it?.email, reason: 'invalid email' });
      continue;
    }
    accepted.push({
      owner_id: auth.user.id,
      email: check.data.toLowerCase(),
      name: it?.name ? String(it.name).slice(0, 200) : null,
      source: it?.source ? String(it.source).slice(0, 64) : 'manual',
      confirm_token: randomBytes(24).toString('hex'),
    });
  }

  if (accepted.length === 0) {
    return NextResponse.json({ inserted: 0, rejected }, { status: 400 });
  }

  // Upsert on (owner_id, email)
  const { data, error } = await auth.supabase
    .from('subscribers')
    .upsert(accepted, { onConflict: 'owner_id,email', ignoreDuplicates: true })
    .select('id, email');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ inserted: (data || []).length, rejected });
}

// DELETE /api/subscribers?id=<n>
export async function DELETE(request) {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const { error } = await auth.supabase
    .from('subscribers')
    .delete()
    .eq('owner_id', auth.user.id)
    .eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
