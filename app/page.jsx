import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Brand OS — Operator stories, turned into a brand',
  description: 'Capture stories in any language, turn them into posts across LinkedIn, X, Instagram, YouTube and newsletters. Built for B2B operators.'
};

export default async function Home() {
  // Signed-in users go straight to the app
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect('/platform');

  return (
    <main className="min-h-screen bg-stone-50" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,700&family=JetBrains+Mono:wght@400;500&family=Inter:wght@300;400;500;600;700&display=swap');
        .font-display { font-family: 'Fraunces', Georgia, serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        .font-sans { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* Nav */}
      <nav className="px-6 md:px-12 py-5 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-stone-500">Brand OS</div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="font-sans text-sm text-stone-700 hover:text-stone-900">Sign in</Link>
          <Link href="/login" className="px-4 py-2 bg-stone-900 text-stone-50 font-sans text-sm hover:bg-stone-800">Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 md:px-12 pt-12 md:pt-20 pb-16 md:pb-24 max-w-5xl mx-auto relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-100 rounded-full blur-3xl opacity-40 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-stone-200 rounded-full blur-3xl opacity-40 pointer-events-none" />
        <div className="relative text-center">
          <div className="font-mono text-[10px] tracking-[0.3em] text-stone-500 uppercase mb-4">
            For operators in MENA · South Asia · Emerging markets
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-light text-stone-900 leading-[1.02] tracking-tight mb-6 max-w-4xl mx-auto">
            The stories you tell over coffee.<br />
            <em className="text-stone-600">Turned into a personal brand.</em>
          </h1>
          <p className="font-sans text-lg md:text-xl text-stone-600 leading-relaxed max-w-2xl mx-auto mb-8">
            Most brand tools help you <em>write</em>. Brand OS helps you <em>remember</em> — speak a story in Urdu, Arabic, Hindi or English, and we'll structure it, translate it, and turn it into posts across every platform.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/login"
              className="px-7 py-3.5 bg-stone-900 text-stone-50 font-sans text-sm hover:bg-stone-800"
            >
              Start free — no card
            </Link>
            <a
              href="#how"
              className="px-7 py-3.5 border border-stone-300 hover:border-stone-900 font-sans text-sm text-stone-700"
            >
              See how it works
            </a>
          </div>
          <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-stone-500 mt-6">
            5 stories, 1 ICP, unlimited captures · free forever
          </div>
        </div>
      </section>

      {/* What it is */}
      <section className="bg-stone-950 text-stone-50 px-6 md:px-12 py-16 md:py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-900 opacity-20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-5xl mx-auto">
          <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-stone-500 mb-4">What you get</div>
          <h2 className="font-display text-4xl md:text-5xl font-light leading-tight tracking-tight mb-12 max-w-3xl">
            A complete brand operating system.<br />
            <span className="text-stone-400">Not another scheduler.</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { num: '01', title: 'Voice → Story', body: 'Record in any language. AI translates and structures it into a story with a lesson — the kind people actually read.' },
              { num: '02', title: 'One story · five formats', body: 'LinkedIn post + X thread + Instagram carousel + YouTube short + newsletter section. All from one source. One click.' },
              { num: '03', title: 'Brand DNA Lab', body: 'Origin moments, values, archetype, voice analysis. AI synthesizes a one-page manifesto that anchors everything you write.' },
              { num: '04', title: 'Conversations Hub', body: 'Every DM tracked from "new" to "closed won". AI drafts replies in your voice. The CRM creators actually need.' },
              { num: '05', title: 'Conversion Lab', body: 'Waiting lists, assessments, webinars, mini-courses — the four mechanisms that turn warm attention into named contacts.' },
              { num: '06', title: 'Public Profile', body: 'A linkable landing page generated from your DNA. Drop the URL in any bio.' }
            ].map((f) => (
              <div key={f.num} className="bg-stone-900 border border-stone-800 p-6">
                <div className="font-mono text-xs text-stone-500 mb-3">{f.num}</div>
                <div className="font-display text-xl font-medium mb-2">{f.title}</div>
                <div className="font-sans text-sm text-stone-400 leading-relaxed">{f.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="px-6 md:px-12 py-16 md:py-24 max-w-5xl mx-auto">
        <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-stone-500 mb-4 text-center">The flow</div>
        <h2 className="font-display text-4xl md:text-5xl font-light text-stone-900 leading-tight tracking-tight mb-16 text-center">
          From thought → post in 90 seconds
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { n: 1, t: 'Speak it', d: 'Tap the mic. Talk for 30s in any language about something that happened to you this week.' },
            { n: 2, t: 'AI structures it', d: 'Translates, finds the lesson, fits it to the personal-brand framework. ~5 seconds.' },
            { n: 3, t: 'Choose a format', d: 'LinkedIn post? Thread? Newsletter? Pick one or generate all five at once.' },
            { n: 4, t: 'Ship it', d: 'Copy, paste, publish. Track DMs you get back in the Conversations Hub.' }
          ].map((s, i) => (
            <div key={s.n} className="relative">
              <div className="bg-white border border-stone-200 p-6 h-full">
                <div className="font-mono text-xs text-stone-400 mb-2">Step {s.n}</div>
                <div className="font-display text-xl text-stone-900 font-medium mb-2">{s.t}</div>
                <div className="font-sans text-sm text-stone-600 leading-relaxed">{s.d}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="px-6 md:px-12 py-16 md:py-24 bg-amber-50 border-y border-amber-200">
        <div className="max-w-3xl mx-auto text-center">
          <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-amber-800 mb-4">Pricing</div>
          <h2 className="font-display text-4xl md:text-5xl font-light text-stone-900 leading-tight tracking-tight mb-4">
            Free to start. Always.
          </h2>
          <p className="font-sans text-base text-stone-700 leading-relaxed mb-8 max-w-xl mx-auto">
            5 stories, 30 AI generations per hour, full platform access. Upgrade later when you need unlimited capture and team features.
          </p>
          <Link
            href="/login"
            className="inline-block px-7 py-3.5 bg-stone-900 text-stone-50 font-sans text-sm hover:bg-stone-800"
          >
            Create your account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-10 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-stone-500 mb-2">Brand OS</div>
            <div className="font-sans text-xs text-stone-500">An operator's personal-brand platform.</div>
          </div>
          <div className="flex gap-4 font-sans text-xs text-stone-600">
            <Link href="/privacy" className="hover:text-stone-900">Privacy</Link>
            <Link href="/terms" className="hover:text-stone-900">Terms</Link>
            <Link href="/login" className="hover:text-stone-900">Sign in</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
