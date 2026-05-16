import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

// Public confirmation endpoint. Subscriber clicks the link from their inbox.
// We use the service role here because the row may belong to any owner.
export async function GET(request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return new NextResponse('Confirmation is disabled (admin: set SUPABASE_SERVICE_ROLE_KEY).', { status: 503 });
  }
  const token = new URL(request.url).searchParams.get('token');
  if (!token || !/^[a-f0-9]{40,80}$/i.test(token)) {
    return new NextResponse('Invalid token.', { status: 400 });
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const { data, error } = await supabase
    .from('subscribers')
    .update({ confirmed_at: new Date().toISOString() })
    .eq('confirm_token', token)
    .is('confirmed_at', null)
    .select('email')
    .maybeSingle();

  if (error) return new NextResponse('Error.', { status: 500 });
  if (!data) return new NextResponse('This link has already been used or is invalid.', { status: 410 });

  return new NextResponse(
    `<html><body style="font-family: system-ui; padding: 60px; text-align: center; background: #fafaf9;">
      <h1 style="font-weight: 300;">You're confirmed.</h1>
      <p style="color: #57534e;">Thanks for subscribing.</p>
    </body></html>`,
    { status: 200, headers: { 'Content-Type': 'text/html' } }
  );
}
