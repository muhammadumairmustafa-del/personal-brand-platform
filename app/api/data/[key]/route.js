import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

async function requireUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  return { supabase, user };
}

export async function GET(_request, { params }) {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  const { data, error } = await auth.supabase
    .from('user_data')
    .select('value')
    .eq('user_id', auth.user.id)
    .eq('key', decodeURIComponent(params.key))
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ value: null });

  // The platform expects { value: stringified-json }. We store JSONB and re-stringify.
  return NextResponse.json({ value: JSON.stringify(data.value) });
}

export async function PUT(request, { params }) {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  if (!body || typeof body.value !== 'string') {
    return NextResponse.json({ error: 'Body must be { value: <stringified JSON> }' }, { status: 400 });
  }

  let parsed;
  try { parsed = JSON.parse(body.value); }
  catch { return NextResponse.json({ error: 'value must be valid stringified JSON' }, { status: 400 }); }

  const { error } = await auth.supabase
    .from('user_data')
    .upsert(
      { user_id: auth.user.id, key: decodeURIComponent(params.key), value: parsed, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,key' }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request, { params }) {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  const { error } = await auth.supabase
    .from('user_data')
    .delete()
    .eq('user_id', auth.user.id)
    .eq('key', decodeURIComponent(params.key));

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
