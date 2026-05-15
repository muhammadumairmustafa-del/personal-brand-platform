import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Allowlist of every user-data key the platform legitimately uses. Anything else
// is rejected — defends against (a) typos that silently corrupt user data and
// (b) malicious clients trying to write internal/reserved keys.
//
// Keep this in sync with the `keys` array in components/PersonalBrandPlatform.jsx
// (inside the main load useEffect).
const ALLOWED_KEYS = new Set([
  'profile',
  'stories',
  'content',
  'funnels',
  'calendar',
  'icps',
  'hooks',
  'analytics',
  'batches',
  'dna',
  'photoMining',
  'optins',
  'revenuePlan',
  'aio',
  'ideas',
  'briefing',
  'conversations',
  'outbound',
  'swipeFile',
  'newsletters',
  'proof',
  'publicProfile'
]);

function validateKey(rawKey) {
  let decoded;
  try {
    decoded = decodeURIComponent(rawKey || '');
  } catch {
    return null;
  }
  if (!ALLOWED_KEYS.has(decoded)) return null;
  return decoded;
}

async function requireUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  return { supabase, user };
}

export async function GET(_request, { params }) {
  const key = validateKey(params.key);
  if (!key) return NextResponse.json({ error: 'Invalid key' }, { status: 400 });

  const auth = await requireUser();
  if (auth.error) return auth.error;

  const { data, error } = await auth.supabase
    .from('user_data')
    .select('value')
    .eq('user_id', auth.user.id)
    .eq('key', key)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ value: null });

  // The platform expects { value: stringified-json }. We store JSONB and re-stringify.
  return NextResponse.json({ value: JSON.stringify(data.value) });
}

export async function PUT(request, { params }) {
  const key = validateKey(params.key);
  if (!key) return NextResponse.json({ error: 'Invalid key' }, { status: 400 });

  const auth = await requireUser();
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  if (!body || typeof body.value !== 'string') {
    return NextResponse.json({ error: 'Body must be { value: <stringified JSON> }' }, { status: 400 });
  }

  // Cap incoming payload — protect against runaway writes.
  if (body.value.length > 2_000_000) {
    return NextResponse.json({ error: 'Payload too large (2 MB max)' }, { status: 413 });
  }

  let parsed;
  try { parsed = JSON.parse(body.value); }
  catch { return NextResponse.json({ error: 'value must be valid stringified JSON' }, { status: 400 }); }

  const { error } = await auth.supabase
    .from('user_data')
    .upsert(
      { user_id: auth.user.id, key, value: parsed, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,key' }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request, { params }) {
  const key = validateKey(params.key);
  if (!key) return NextResponse.json({ error: 'Invalid key' }, { status: 400 });

  const auth = await requireUser();
  if (auth.error) return auth.error;

  const { error } = await auth.supabase
    .from('user_data')
    .delete()
    .eq('user_id', auth.user.id)
    .eq('key', key);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
