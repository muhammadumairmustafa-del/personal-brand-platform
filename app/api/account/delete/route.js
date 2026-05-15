import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

// Hard-deletes the user's data + the auth account itself. GDPR right to erasure.
// Requires SUPABASE_SERVICE_ROLE_KEY to delete the auth.users row.
export async function POST(request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Confirmation token check — the client must send the user's email back to
  // confirm they really meant it. Prevents accidental deletes.
  let body;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  if (body?.confirmEmail !== user.email) {
    return NextResponse.json({ error: 'Confirmation email does not match your account.' }, { status: 400 });
  }

  // 1. Delete all user_data rows (the RLS-protected client can do this — only their own rows)
  const { error: dataErr } = await supabase
    .from('user_data')
    .delete()
    .eq('user_id', user.id);
  if (dataErr) {
    return NextResponse.json({ error: 'Failed to delete data: ' + dataErr.message }, { status: 500 });
  }

  // 2. Delete the auth user via the service role (the regular client can't do this)
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return NextResponse.json({
      error: 'Your data was deleted but the auth account requires admin privileges to remove. Email support to finish account closure.',
      partial: true
    }, { status: 503 });
  }

  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { error: authErr } = await admin.auth.admin.deleteUser(user.id);
  if (authErr) {
    return NextResponse.json({
      error: 'Data deleted. Auth account deletion failed: ' + authErr.message,
      partial: true
    }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
