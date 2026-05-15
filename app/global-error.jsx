'use client';

// Catches the rare class of errors that crash the root layout itself.
// Renders without any of the app's chrome because that chrome may be what failed.
export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', background: '#fafaf9', color: '#1c1917' }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ maxWidth: '480px', width: '100%', background: '#ffffff', border: '1px solid #e7e5e4', padding: '32px' }}>
            <div style={{ fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#b91c1c', marginBottom: '12px', fontFamily: 'ui-monospace, monospace' }}>
              Something broke
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 300, color: '#1c1917', lineHeight: 1.1, marginBottom: '12px', fontFamily: 'Georgia, serif' }}>
              The app hit a problem.
            </h1>
            <p style={{ fontSize: '14px', color: '#44403c', lineHeight: 1.6, marginBottom: '24px' }}>
              Your data is safe in your account. Try reloading — if it keeps happening, sign out and back in.
            </p>
            {error?.digest && (
              <div style={{ background: '#fafaf9', border: '1px solid #e7e5e4', padding: '8px 12px', marginBottom: '24px', fontFamily: 'ui-monospace, monospace', fontSize: '11px', color: '#57534e' }}>
                Reference: {error.digest}
              </div>
            )}
            <button
              onClick={() => reset()}
              style={{ padding: '10px 20px', background: '#1c1917', color: '#fafaf9', border: 'none', fontSize: '14px', cursor: 'pointer' }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
