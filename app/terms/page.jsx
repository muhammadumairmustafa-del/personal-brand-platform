import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service — Brand OS',
  description: 'The terms you agree to by using Brand OS.'
};

export default function TermsOfService() {
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
        <h1 className="font-display text-5xl font-light text-stone-900 leading-tight tracking-tight mb-8">Terms of Service</h1>

        <div className="prose font-sans text-stone-800 space-y-6 leading-relaxed">
          <p className="text-base">
            By using Brand OS you agree to these terms. They are written in plain English on purpose. Email us if any of
            it is unclear.
          </p>

          <Section title="The service">
            <p>
              Brand OS is a personal-branding platform. We provide tools to capture, organize, and produce content based
              on your own stories. Some features call third-party AI models (currently Anthropic Claude) to generate
              drafts on your behalf.
            </p>
          </Section>

          <Section title="Your account">
            <ul className="list-disc pl-6 space-y-2">
              <li>You must be at least 16 years old to use Brand OS.</li>
              <li>You are responsible for keeping your password (or Google account) secure.</li>
              <li>You are responsible for everything created or sent from your account.</li>
              <li>You can close your account at any time by emailing us.</li>
            </ul>
          </Section>

          <Section title="Your content">
            <p>
              You retain full ownership of everything you create on Brand OS. We claim no rights over your stories,
              posts, or any other content. You grant us a limited license to process and display your content as
              required to operate the service (storing it in our database, sending it to AI providers when you request
              generation, displaying it back to you in the app).
            </p>
            <p>
              When you choose to publish a public profile page, you make that specific content publicly accessible by
              your own action. We are not responsible for who reads it.
            </p>
          </Section>

          <Section title="Acceptable use">
            <p>
              Brand OS is for legitimate personal branding. Don't use it to:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Generate or distribute content that is unlawful, harassing, defamatory, or violates someone else's privacy.</li>
              <li>Impersonate another person or misrepresent your affiliation.</li>
              <li>Attempt to bypass rate limits, reverse-engineer the service, or interfere with infrastructure.</li>
              <li>Scrape or republish other users' public profile pages at scale.</li>
              <li>Use the AI features to generate spam, phishing material, or content that violates Anthropic's usage policy.</li>
            </ul>
            <p>We may suspend accounts that violate these rules.</p>
          </Section>

          <Section title="Service availability">
            <p>
              Brand OS is provided "as is." We aim for high uptime but make no formal guarantees. Service may be
              interrupted for maintenance, upstream outages (Vercel, Supabase, Anthropic), or other reasons. Your data
              is durable in the database during these events.
            </p>
          </Section>

          <Section title="AI-generated content">
            <p>
              AI suggestions are drafts, not authoritative output. You are responsible for reviewing anything generated
              before publishing it. We do not warrant accuracy, originality, or appropriateness of AI output.
            </p>
          </Section>

          <Section title="Limits of liability">
            <p>
              To the maximum extent permitted by law, Brand OS and its operators are not liable for indirect,
              incidental, or consequential damages arising from your use of the service. Our total liability is capped
              at the amount you have paid us in the preceding 12 months (which is currently zero — Brand OS is free).
            </p>
          </Section>

          <Section title="Changes">
            <p>
              We may update these terms. Material changes will be communicated by email and reflected in the
              "Last updated" date above. Continued use after changes means you accept them.
            </p>
          </Section>

          <Section title="Governing law">
            <p>
              These terms are governed by the laws of the operator's country of residence. Disputes will be handled in
              good faith first by direct communication.
            </p>
          </Section>
        </div>

        <div className="mt-12 pt-8 border-t border-stone-200 flex flex-wrap gap-4 font-sans text-sm">
          <Link href="/privacy" className="text-stone-700 hover:text-stone-900 underline">Privacy Policy</Link>
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
