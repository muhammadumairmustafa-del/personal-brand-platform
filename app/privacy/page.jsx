import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy — Brand OS',
  description: 'How Brand OS collects, stores, and uses your data.'
};

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-stone-50" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,700&family=JetBrains+Mono:wght@400;500&family=Inter:wght@300;400;500;600&display=swap');
        .font-display { font-family: 'Fraunces', Georgia, serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        .font-sans { font-family: 'Inter', sans-serif; }
      `}</style>

      <nav className="px-6 md:px-12 py-5 flex justify-between items-center max-w-5xl mx-auto">
        <Link href="/" className="font-mono text-[10px] tracking-[0.3em] uppercase text-stone-500 hover:text-stone-900">Brand OS</Link>
        <Link href="/login" className="font-sans text-sm text-stone-700 hover:text-stone-900">Sign in</Link>
      </nav>

      <article className="px-6 md:px-12 py-12 max-w-3xl mx-auto">
        <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-stone-500 mb-4">Last updated: October 2026</div>
        <h1 className="font-display text-5xl font-light text-stone-900 leading-tight tracking-tight mb-8">Privacy Policy</h1>

        <div className="prose font-sans text-stone-800 space-y-6 leading-relaxed">
          <p className="text-base">
            This is a plain-English summary of how Brand OS handles your data. If you have questions, contact us at
            the email on the sign-in page.
          </p>

          <Section title="What we collect">
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account data:</strong> your email address and an encrypted password (or Google account ID if you sign in via Google).</li>
              <li><strong>Platform data:</strong> everything you create inside the app — your profile, stories, ICPs, content drafts, conversations, etc. This is stored on a per-user basis and only you can read it.</li>
              <li><strong>Usage telemetry:</strong> currently <em>none</em>. We do not run analytics tracking. (If we add tools like PostHog later, this section will be updated and you'll be notified.)</li>
            </ul>
          </Section>

          <Section title="Where it's stored">
            <p>
              All data is stored in <strong>Supabase</strong> (PostgreSQL), hosted in a region we select for performance.
              Database access is protected by Row Level Security — a Supabase feature that ensures only the
              authenticated user can read or write their own data, enforced at the database layer.
            </p>
          </Section>

          <Section title="Who can see your data">
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>You.</strong> Always.</li>
              <li><strong>Brand OS administrators.</strong> Only when actively responding to a support request you initiated, or investigating a suspected security incident. We do not browse user data.</li>
              <li><strong>Anthropic (the AI provider).</strong> When you use AI features, the content you send is forwarded to Anthropic's API to generate a response. Per Anthropic's policy, this content is not used to train their models.</li>
              <li><strong>Anyone on the internet</strong> — only if you explicitly publish a public profile page. The public page shows only fields you mark as featured. Your raw stories, conversations, and other data are never exposed.</li>
            </ul>
          </Section>

          <Section title="Your rights">
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your data at any time inside the platform.</li>
              <li>Delete any item permanently using the trash icons inside each section.</li>
              <li>Request a full account deletion by emailing us. We will delete all your data within 30 days.</li>
              <li>Export your data — currently manual; email us and we'll send a JSON dump. Self-service export is planned.</li>
            </ul>
          </Section>

          <Section title="Cookies">
            <p>
              We use only the cookies required to keep you signed in (set by Supabase). No third-party tracking
              cookies, no advertising cookies. By using Brand OS you consent to these functional cookies.
            </p>
          </Section>

          <Section title="Changes to this policy">
            <p>
              If we materially change how we handle your data, we will notify you via the email on your account
              and update the "Last updated" date at the top.
            </p>
          </Section>
        </div>

        <div className="mt-12 pt-8 border-t border-stone-200 flex flex-wrap gap-4 font-sans text-sm">
          <Link href="/terms" className="text-stone-700 hover:text-stone-900 underline">Terms of Service</Link>
          <Link href="/" className="text-stone-700 hover:text-stone-900 underline">Back to home</Link>
        </div>
      </article>
    </main>
  );
}

function Section({ title, children }) {
  return (
    <section>
      <h2 className="font-display text-2xl font-medium text-stone-900 mt-8 mb-3">{title}</h2>
      <div className="font-sans text-base text-stone-700 space-y-3">{children}</div>
    </section>
  );
}
