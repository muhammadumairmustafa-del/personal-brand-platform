import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { applyOp } from '@/lib/dataPatchOps';

export const runtime = 'nodejs';

// Mirror of the allowlist in ../route.js. Keep in sync.
const ALLOWED_KEYS = new Set([
  'profile','stories','content','funnels','calendar','icps','hooks','analytics',
  'batches','dna','photoMining','optins','revenuePlan','aio','ideas','briefing',
  'conversations','outbound','swipeFile','newsletters','proof','publicProfile','coachSession'
]);

function validateKey(rawKey) {
  let decoded;
  try { decoded = decodeURIComponent(rawKey || ''); } catch { return null; }
  return ALLOWED_KEYS.has(decoded) ? decoded : null;
}

export async function PATCH(request, { params }) {
  const key = validateKey(params.key);
  if (!key) return NextResponse.json({ error: 'Invalid key' }, { status: 400 });

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body?.ops || !Array.isArray(body.ops)) {
    return NextResponse.json({ error: 'Body must be { ops: [...] }' }, { status: 400 });
  }
  if (body.ops.length > 100) {
    return NextResponse.json({ error: 'Too many ops in one request (max 100)' }, { status: 400 });
  }

  // Read current value
  const { data: row } = await supabase
    .from('user_data')
    .select('value')
    .eq('user_id', user.id)
    .eq('key', key)
    .maybeSingle();

  let next = row?.value !== undefined ? row.value : null;
  try {
    for (const op of body.ops) next = applyOp(next, op);
  } catch (e) {
    return NextResponse.json({ error: String(e.message || e) }, { status: 400 });
  }

  const { error } = await supabase
    .from('user_data')
    .upsert(
      { user_id: user.id, key, value: next, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,key' }
    );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, value: next });
}
