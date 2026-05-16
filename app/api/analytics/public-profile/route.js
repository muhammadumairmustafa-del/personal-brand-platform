import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

// Returns aggregate view counts for the authenticated user's public profile.
export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const since30 = new Date(now - 30 * day).toISOString();
  const since7 = new Date(now - 7 * day).toISOString();
  const since1 = new Date(now - day).toISOString();

  const { data: rows, error } = await supabase
    .from('page_views')
    .select('viewed_at, referrer')
    .eq('user_id', user.id)
    .gte('viewed_at', since30);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const total = rows?.length || 0;
  const last7 = (rows || []).filter((r) => r.viewed_at >= since7).length;
  const last24h = (rows || []).filter((r) => r.viewed_at >= since1).length;

  // Top referrer hosts
  const hosts = {};
  for (const r of rows || []) {
    if (!r.referrer) continue;
    try {
      const h = new URL(r.referrer).hostname;
      hosts[h] = (hosts[h] || 0) + 1;
    } catch {}
  }
  const topReferrers = Object.entries(hosts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([host, count]) => ({ host, count }));

  return NextResponse.json({ total30d: total, last7d: last7, last24h, topReferrers });
}
