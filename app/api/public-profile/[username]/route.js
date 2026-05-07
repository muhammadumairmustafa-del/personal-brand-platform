import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// This endpoint is intentionally public. It uses the service role to bypass RLS
// and reads ONLY whitelisted public-safe keys (publicProfile, dna, stories,
// optins, profile name/title — never anything sensitive).
export async function GET(_request, { params }) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ error: 'Public profile lookup is disabled. Add SUPABASE_SERVICE_ROLE_KEY env var to enable.' }, { status: 503 });
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const username = (params.username || '').toLowerCase().replace(/[^a-z0-9-]/g, '');
  if (!username) return NextResponse.json({ error: 'Invalid username' }, { status: 400 });

  // Find the user_id whose publicProfile.username matches
  const { data: matches, error } = await supabase
    .from('user_data')
    .select('user_id, value')
    .eq('key', 'publicProfile');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const match = matches?.find(m => (m.value?.username || '').toLowerCase() === username);
  if (!match) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Bulk-fetch the public-safe slices for this user
  const [profileR, dnaR, storiesR, optinsR] = await Promise.all([
    supabase.from('user_data').select('value').eq('user_id', match.user_id).eq('key', 'profile').maybeSingle(),
    supabase.from('user_data').select('value').eq('user_id', match.user_id).eq('key', 'dna').maybeSingle(),
    supabase.from('user_data').select('value').eq('user_id', match.user_id).eq('key', 'stories').maybeSingle(),
    supabase.from('user_data').select('value').eq('user_id', match.user_id).eq('key', 'optins').maybeSingle()
  ]);

  const profile = profileR.data?.value || {};
  const dna = dnaR.data?.value || {};
  const allStories = Array.isArray(storiesR.data?.value) ? storiesR.data.value : [];
  const allOptins = Array.isArray(optinsR.data?.value) ? optinsR.data.value : [];
  const publicProfile = match.value || {};

  // Surface ONLY the fields the user explicitly chose to feature
  const featuredStoryIds = publicProfile.featuredStoryIds || [];
  const featuredStories = allStories
    .filter(s => featuredStoryIds.includes(s.id))
    .map(s => ({
      // Strip any private metadata
      id: s.id,
      title: s.title,
      lesson: s.lesson,
      category: s.category,
      month: s.month,
      context: s.context
    }));

  const featuredOptin = allOptins.find(o => o.id === parseInt(publicProfile.featuredOptinId)) || null;
  const optinPublic = featuredOptin ? {
    type: featuredOptin.type,
    name: featuredOptin.name || featuredOptin.finalTitle || featuredOptin.finalName,
    headline: featuredOptin.headline,
    subtitle: featuredOptin.subtitle || featuredOptin.subhead || featuredOptin.promise
  } : null;

  return NextResponse.json({
    profile: {
      name: profile.name || '',
      title: profile.title || '',
      location: profile.location || ''
    },
    publicProfile: {
      username: publicProfile.username,
      headline: publicProfile.headline,
      subhead: publicProfile.subhead,
      showManifesto: publicProfile.showManifesto !== false,
      linkedin: publicProfile.linkedin,
      twitter: publicProfile.twitter,
      email: publicProfile.email,
      calendarUrl: publicProfile.calendarUrl
    },
    manifesto: dna.manifesto ? {
      manifesto: dna.manifesto.manifesto,
      tagline: dna.manifesto.tagline,
      elevatorPitch: dna.manifesto.elevatorPitch
    } : null,
    stories: featuredStories,
    optin: optinPublic
  });
}
