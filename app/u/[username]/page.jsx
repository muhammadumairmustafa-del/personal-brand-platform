import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import TrackView from './TrackView';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getProfile(username) {
  const h = headers();
  const host = h.get('host');
  const proto = h.get('x-forwarded-proto') || (host?.includes('localhost') ? 'http' : 'https');
  const r = await fetch(`${proto}://${host}/api/public-profile/${encodeURIComponent(username)}`, { cache: 'no-store' });
  if (!r.ok) return null;
  return r.json();
}

export async function generateMetadata({ params }) {
  const data = await getProfile(params.username);
  if (!data) return { title: 'Profile not found' };
  const name = data.profile?.name || params.username;
  return {
    title: `${name} — ${data.publicProfile?.headline || data.profile?.title || 'Brand OS'}`,
    description: data.manifesto?.elevatorPitch || data.publicProfile?.subhead || `${name}'s personal brand page`
  };
}

export default async function PublicProfilePage({ params }) {
  const data = await getProfile(params.username);
  if (!data) notFound();

  const { profile, publicProfile, manifesto, stories, optin } = data;
  const firstName = profile.name?.split(' ')[0] || params.username;

  return (
    <div className="min-h-screen bg-stone-50" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
      <TrackView username={publicProfile?.username || params.username} />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,700&family=JetBrains+Mono:wght@400;500;600&family=Inter:wght@300;400;500;600;700&display=swap');
        .font-display { font-family: 'Fraunces', Georgia, serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        .font-sans { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* Hero */}
      <section className="px-6 py-24 text-center relative overflow-hidden max-w-4xl mx-auto">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-100 rounded-full blur-3xl opacity-40 pointer-events-none" />
        <div className="relative">
          <div className="font-mono text-[10px] tracking-[0.3em] text-stone-500 uppercase mb-4">{profile.location || 'Studio'}</div>
          <h1 className="font-display text-7xl font-light text-stone-900 leading-[1.05] tracking-tight mb-4">
            {firstName}<span className="text-stone-400">.</span>
          </h1>
          {(publicProfile.headline || manifesto?.tagline || profile.title) && (
            <div className="font-display text-3xl font-light text-stone-700 italic max-w-2xl mx-auto leading-snug mb-6">
              {publicProfile.headline || manifesto?.tagline || profile.title}
            </div>
          )}
          {(publicProfile.subhead || manifesto?.elevatorPitch) && (
            <div className="font-sans text-base text-stone-600 max-w-xl mx-auto leading-relaxed">
              {publicProfile.subhead || manifesto?.elevatorPitch}
            </div>
          )}
        </div>
      </section>

      {/* Manifesto */}
      {publicProfile.showManifesto && manifesto?.manifesto && (
        <section className="px-6 py-20 bg-stone-950 text-stone-50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-900 opacity-20 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-3xl mx-auto relative">
            <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-stone-500 mb-4">Manifesto</div>
            <div className="font-display text-2xl font-light leading-relaxed whitespace-pre-wrap">{manifesto.manifesto}</div>
          </div>
        </section>
      )}

      {/* Featured stories */}
      {stories?.length > 0 && (
        <section className="px-6 py-20 max-w-4xl mx-auto">
          <div className="font-mono text-[10px] tracking-[0.3em] text-stone-500 uppercase mb-8 text-center">Stories I tell</div>
          <div className="grid grid-cols-1 gap-6">
            {stories.map(s => (
              <article key={s.id} className="bg-white border border-stone-200 p-7">
                <div className="font-mono text-[10px] uppercase tracking-wider text-stone-500 mb-2">{s.month} · {s.category}</div>
                <h2 className="font-display text-3xl font-light text-stone-900 leading-tight mb-3">{s.title}</h2>
                {s.context && <p className="font-sans text-base text-stone-700 leading-relaxed mb-3">{s.context}</p>}
                {s.lesson && (
                  <div className="border-l-4 border-amber-500 bg-amber-50 p-4">
                    <div className="font-mono text-[10px] uppercase tracking-wider text-amber-800 mb-1">The lesson</div>
                    <div className="font-display text-lg text-stone-800 italic">{s.lesson}</div>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Opt-in */}
      {optin && (
        <section className="px-6 py-20 bg-amber-50 border-y border-amber-200">
          <div className="max-w-2xl mx-auto text-center">
            <div className="font-mono text-[10px] tracking-[0.3em] text-amber-800 uppercase mb-3">
              {optin.type === 'waitlist' && 'Get early access'}
              {optin.type === 'assessment' && 'Take the assessment'}
              {optin.type === 'webinar' && 'Join the workshop'}
              {optin.type === 'minicourse' && 'Get the mini-course'}
            </div>
            <h3 className="font-display text-4xl font-light text-stone-900 leading-tight mb-4">
              {optin.headline || optin.name}
            </h3>
            {optin.subtitle && (
              <p className="font-sans text-base text-stone-700 leading-relaxed mb-6">{optin.subtitle}</p>
            )}
            <a
              href={publicProfile.email ? `mailto:${publicProfile.email}?subject=Interested in ${encodeURIComponent(optin.name || '')}` : '#'}
              className="inline-block px-8 py-3 bg-stone-900 text-stone-50 font-sans text-sm hover:bg-stone-800"
            >
              Join the list
            </a>
          </div>
        </section>
      )}

      {/* Contact */}
      {(publicProfile.linkedin || publicProfile.twitter || publicProfile.email || publicProfile.calendarUrl) && (
        <section className="px-6 py-16 text-center max-w-4xl mx-auto">
          <div className="font-mono text-[10px] tracking-[0.3em] text-stone-500 uppercase mb-6">Reach out</div>
          <div className="flex justify-center gap-3 flex-wrap">
            {publicProfile.linkedin && (
              <a href={publicProfile.linkedin} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 border border-stone-300 hover:border-stone-900 font-sans text-sm">LinkedIn</a>
            )}
            {publicProfile.twitter && (
              <a href={publicProfile.twitter} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 border border-stone-300 hover:border-stone-900 font-sans text-sm">X / Twitter</a>
            )}
            {publicProfile.email && (
              <a href={`mailto:${publicProfile.email}`} className="px-5 py-2.5 border border-stone-300 hover:border-stone-900 font-sans text-sm">Email</a>
            )}
            {publicProfile.calendarUrl && (
              <a href={publicProfile.calendarUrl} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-stone-900 text-stone-50 font-sans text-sm">Book a call</a>
            )}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-stone-200 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-stone-400">
        Built with Brand OS
      </footer>
    </div>
  );
}
