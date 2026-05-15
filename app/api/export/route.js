import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

// Streams the user's entire data set as a JSON download. GDPR right to portability.
export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: rows, error } = await supabase
    .from('user_data')
    .select('key, value, updated_at')
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const payload = {
    exportedAt: new Date().toISOString(),
    user: { id: user.id, email: user.email },
    data: (rows || []).reduce((acc, r) => {
      // Skip internal bookkeeping keys (history snapshots, AI usage counter)
      if (r.key.startsWith('_')) return acc;
      acc[r.key] = r.value;
      return acc;
    }, {})
  };

  const filename = `brand-os-export-${new Date().toISOString().split('T')[0]}.json`;
  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`
    }
  });
}
