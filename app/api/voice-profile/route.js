import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5';
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

// POST /api/voice-profile
// Reads the user's stories + recent content, asks Claude to synthesize a
// "voice fingerprint" string, and writes it to dna.voice.fingerprint so
// /api/ai can inject it into every subsequent system prompt.
export async function POST() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'Server missing ANTHROPIC_API_KEY' }, { status: 500 });

  // Pull source material
  const { data: rows } = await supabase
    .from('user_data')
    .select('key, value, updated_at')
    .eq('user_id', user.id)
    .in('key', ['stories', 'content', 'dna']);

  const byKey = (rows || []).reduce((acc, r) => { acc[r.key] = r.value; return acc; }, {});
  const stories = Array.isArray(byKey.stories) ? byKey.stories : [];
  const content = Array.isArray(byKey.content) ? byKey.content : [];
  const dna = byKey.dna || {};

  // Honor TTL — if recent, don't rebuild
  const lastBuiltAt = dna?.voice?.fingerprintBuiltAt ? new Date(dna.voice.fingerprintBuiltAt).getTime() : 0;
  if (Date.now() - lastBuiltAt < TTL_MS && dna?.voice?.fingerprint) {
    return NextResponse.json({ fingerprint: dna.voice.fingerprint, cached: true });
  }

  // Sample up to 30 snippets so we don't blow context budget
  const sampleStories = stories.slice(0, 15).map((s) => `[Story: ${s.title}]\nLesson: ${s.lesson}\nContext: ${s.context || ''}`);
  const sampleContent = content.slice(0, 15).map((c) => `[${c.format || 'Post'}]\nHook: ${c.hook || ''}\nBody: ${(c.body || '').slice(0, 400)}`);
  const corpus = [...sampleStories, ...sampleContent].join('\n\n---\n\n');

  if (corpus.trim().length < 200) {
    return NextResponse.json({ error: 'Not enough source material yet. Capture a few stories or write a few posts first.' }, { status: 400 });
  }

  const prompt = `Analyze this writer's voice based on their actual stories and posts. Return a single concise paragraph (80-150 words) that captures HOW they write — tone, sentence rhythm, vocabulary tics, what they avoid, how they open and close. Write it as a directive ("Writes in short declarative sentences. Avoids corporate jargon. Opens with a concrete detail..."). Don't summarize the content — describe the voice.

SAMPLES:
${corpus}

Return ONLY the voice description paragraph. No preamble.`;

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }]
    })
  });
  if (!r.ok) {
    const errBody = await r.text();
    return NextResponse.json({ error: `Anthropic ${r.status}: ${errBody.slice(0, 200)}` }, { status: 502 });
  }
  const data = await r.json();
  const fingerprint = (data?.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('').trim();
  if (!fingerprint) return NextResponse.json({ error: 'Empty response from model.' }, { status: 502 });

  // Persist to dna.voice.fingerprint
  const newDna = { ...dna, voice: { ...(dna.voice || {}), fingerprint, fingerprintBuiltAt: new Date().toISOString() } };
  await supabase
    .from('user_data')
    .upsert(
      { user_id: user.id, key: 'dna', value: newDna, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,key' }
    );

  return NextResponse.json({ fingerprint, cached: false });
}
