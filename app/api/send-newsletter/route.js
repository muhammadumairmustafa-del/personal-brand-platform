import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const maxDuration = 30;

// Send a newsletter via Resend's REST API.
// Requires env vars:
//   RESEND_API_KEY        — your Resend API key (https://resend.com)
//   RESEND_FROM_ADDRESS   — verified sender, e.g. "Your Name <you@yourdomain.com>"
//
// For testing, Resend lets you send TO yourself from "onboarding@resend.dev" without verifying
// a domain. For real sends to other people, verify a domain in Resend dashboard first.

export async function POST(request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.RESEND_FROM_ADDRESS || 'onboarding@resend.dev';
  if (!apiKey) {
    return NextResponse.json({
      error: 'Newsletter sending is not configured. Add RESEND_API_KEY to your environment variables.',
      docs: 'https://resend.com/signup'
    }, { status: 503 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { to, subject, html, text } = body || {};
  if (!Array.isArray(to) || to.length === 0) {
    return NextResponse.json({ error: 'Provide at least one recipient (to: string[])' }, { status: 400 });
  }
  if (!subject || (!html && !text)) {
    return NextResponse.json({ error: 'Provide subject + (html or text body)' }, { status: 400 });
  }
  if (to.length > 50) {
    return NextResponse.json({ error: 'Max 50 recipients per send (use a real ESP for bigger lists).' }, { status: 400 });
  }

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromAddress,
        to,
        subject,
        html: html || undefined,
        text: text || undefined,
        reply_to: user.email,
        // Send to each recipient individually (no shared To: header)
        // Resend handles this when you pass an array; each gets its own message.
      })
    });
    const data = await r.json();
    if (!r.ok) {
      return NextResponse.json({ error: data?.message || 'Send failed', detail: data }, { status: r.status });
    }
    return NextResponse.json({ ok: true, id: data?.id || null, sent: to.length });
  } catch (err) {
    return NextResponse.json({ error: 'Send failed: ' + err.message }, { status: 502 });
  }
}
