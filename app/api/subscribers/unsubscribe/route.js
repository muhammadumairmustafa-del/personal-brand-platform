import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

// Public unsubscribe endpoint. Must be hit from a link in every newsletter
// you send (CAN-SPAM / GDPR / Australia's Spam Act all require it).
export async function GET(request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return new NextResponse('Unsubscribe is disabled (admin: set SUPABASE_SERVICE_ROLE_KEY).', { status: 503 });
  }
  const token = new URL(request.url).searchParams.get('token');
  if (!token) return new NextResponse('Missing token.', { status: 400 });

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const { data, error } = await supabase
    .from('subscribers')
    .update({ unsubscribed_at: new Date().toISOString() })
    .eq('confirm_token', token)
    .select('email')
    .maybeSingle();

  if (error) return new NextResponse('Error.', { status: 500 });
  if (!data) return new NextResponse('Already unsubscribed or invalid link.', { status: 410 });

  return new NextResponse(
    `<html><body style="font-family: system-ui; padding: 60px; text-align: center; background: #fafaf9;">
      <h1 style="font-weight: 300;">You're unsubscribed.</h1>
      <p style="color: #57534e;">No more emails from this list. Sorry to see you go.</p>
    </body></html>`,
    { status: 200, headers: { 'Content-Type': 'text/html' } }
  );
}
