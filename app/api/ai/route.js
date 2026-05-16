import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

// Server-side model pinning. Always ignore whatever the client sends — that protects
// against a stale model name baked into older bundles AND any attempt to point us at
// a more expensive model than we authorize.
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5';

// Per-user rate limits. Free, sensible defaults for solo founders running first 100 users.
const RATE_LIMIT_PER_HOUR = parseInt(process.env.AI_RATE_LIMIT_PER_HOUR || '30', 10);
const RATE_LIMIT_PER_DAY = parseInt(process.env.AI_RATE_LIMIT_PER_DAY || '150', 10);
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export async function POST(request) {
  // ─── Auth ───
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Server missing ANTHROPIC_API_KEY' }, { status: 500 });
  }

  // ─── Rate limit check ───
  // We store usage in the same user_data table under a reserved key. The user's own
  // session can read+write their counter via RLS, which is fine — even if a determined
  // user resets it from devtools, they're only cheating themselves; the real abuse
  // vector (mass-account creation) is gated by Supabase signup throttling.
  const now = Date.now();
  try {
    const { data: usageRow } = await supabase
      .from('user_data')
      .select('value')
      .eq('user_id', user.id)
      .eq('key', '_aiUsage')
      .maybeSingle();

    const usage = usageRow?.value || { hourCount: 0, hourStart: 0, dayCount: 0, dayStart: 0 };
    const inHourWindow = (now - (usage.hourStart || 0)) < HOUR_MS;
    const inDayWindow = (now - (usage.dayStart || 0)) < DAY_MS;
    const hourCount = inHourWindow ? (usage.hourCount || 0) : 0;
    const dayCount = inDayWindow ? (usage.dayCount || 0) : 0;

    if (hourCount >= RATE_LIMIT_PER_HOUR) {
      const retryAfter = Math.max(1, Math.ceil(((usage.hourStart || now) + HOUR_MS - now) / 1000));
      return NextResponse.json(
        {
          error: `AI rate limit hit: ${RATE_LIMIT_PER_HOUR} requests per hour.`,
          retryAfter,
          window: 'hour'
        },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      );
    }
    if (dayCount >= RATE_LIMIT_PER_DAY) {
      const retryAfter = Math.max(1, Math.ceil(((usage.dayStart || now) + DAY_MS - now) / 1000));
      return NextResponse.json(
        {
          error: `AI rate limit hit: ${RATE_LIMIT_PER_DAY} requests per day.`,
          retryAfter,
          window: 'day'
        },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      );
    }

    // Increment & persist (fire-and-forget; failure here shouldn't block the request).
    await supabase
      .from('user_data')
      .upsert(
        {
          user_id: user.id,
          key: '_aiUsage',
          value: {
            hourCount: hourCount + 1,
            hourStart: inHourWindow ? usage.hourStart : now,
            dayCount: dayCount + 1,
            dayStart: inDayWindow ? usage.dayStart : now,
            lastCall: new Date(now).toISOString()
          },
          updated_at: new Date(now).toISOString()
        },
        { onConflict: 'user_id,key' }
      );
  } catch (e) {
    // If the rate-limit read/write fails for some reason, allow the request through.
    // We log but don't block — the alternative (blocking on infra failure) is worse UX.
    console.error('Rate limit check failed:', e);
  }

  // ─── Parse + validate body ───
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  if (!Array.isArray(body?.messages) || body.messages.length === 0) {
    return NextResponse.json({ error: 'Missing messages array' }, { status: 400 });
  }
  // Cap output tokens — defends against runaway costs from a buggy client.
  const requestedMax = parseInt(body.max_tokens, 10);
  const maxTokens = Math.min(
    isNaN(requestedMax) ? 2000 : requestedMax,
    8000
  );

  // ─── Inject voice fingerprint into system prompt ───
  // The Brand DNA Lab stores a "voice fingerprint" describing how the user writes
  // (tone, sentence rhythm, vocabulary). Prepending it makes every AI output sound
  // like the user instead of a generic AI voice — biggest single quality lever.
  let voicePreamble = '';
  try {
    const { data: dnaRow } = await supabase
      .from('user_data')
      .select('value')
      .eq('user_id', user.id)
      .eq('key', 'dna')
      .maybeSingle();
    const fp = dnaRow?.value?.voice?.fingerprint;
    if (fp && typeof fp === 'string' && fp.trim().length > 20) {
      voicePreamble = `The author writes in this voice: ${fp.trim()}\n\nMatch this voice in tone, sentence rhythm, and vocabulary. Don't sound like a generic AI assistant.\n\n`;
    }
  } catch (e) {
    console.error('Voice fingerprint lookup failed:', e);
  }

  // ─── Forward to Anthropic ───
  // Note: we IGNORE body.model entirely. Server pins the model.
  const systemCombined = voicePreamble
    ? voicePreamble + (body.system || '')
    : (body.system || '');

  const payload = {
    model: MODEL,
    max_tokens: maxTokens,
    messages: body.messages,
    ...(systemCombined ? { system: systemCombined } : {})
  };

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(payload)
    });
    const data = await r.json();
    return NextResponse.json(data, { status: r.status });
  } catch (err) {
    return NextResponse.json(
      { error: 'Upstream error', detail: String(err) },
      { status: 502 }
    );
  }
}
