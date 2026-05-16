import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { randomBytes } from 'crypto';
import { validate, emailSchema } from '@/lib/validators';

export const runtime = 'nodejs';
export const maxDuration = 30;

// POST /api/subscribers/import — accepts a CSV string. Supported columns:
//   email, name (or first_name/last_name). Header row required.
export async function POST(request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const csv = body?.csv;
  if (!csv || typeof csv !== 'string') return NextResponse.json({ error: 'Missing csv' }, { status: 400 });
  if (csv.length > 5_000_000) return NextResponse.json({ error: 'CSV too large (5 MB max)' }, { status: 413 });

  const lines = csv.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return NextResponse.json({ error: 'CSV must include a header row and at least one record.' }, { status: 400 });

  const header = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/^"|"$/g, ''));
  const emailIdx = header.indexOf('email');
  const nameIdx = header.indexOf('name');
  const firstIdx = header.indexOf('first_name');
  const lastIdx = header.indexOf('last_name');
  if (emailIdx === -1) return NextResponse.json({ error: 'CSV needs an "email" column.' }, { status: 400 });

  const accepted = [];
  const rejected = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
    const email = parts[emailIdx];
    const check = validate(emailSchema, email || '');
    if (!check.ok) { rejected.push(email); continue; }
    let name = parts[nameIdx] || '';
    if (!name && firstIdx >= 0) name = [parts[firstIdx], parts[lastIdx]].filter(Boolean).join(' ').trim();
    accepted.push({
      owner_id: user.id,
      email: check.data.toLowerCase(),
      name: name || null,
      source: 'csv-import',
      confirm_token: randomBytes(24).toString('hex'),
    });
  }

  if (accepted.length === 0) return NextResponse.json({ inserted: 0, rejected: rejected.length }, { status: 400 });

  const { data, error } = await supabase
    .from('subscribers')
    .upsert(accepted, { onConflict: 'owner_id,email', ignoreDuplicates: true })
    .select('id');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ inserted: (data || []).length, rejected: rejected.length });
}
