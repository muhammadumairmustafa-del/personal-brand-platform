import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Brand OS — Operator stories, turned into a brand',
    template: '%s · Brand OS'
  },
  description: 'Capture stories in any language, turn them into posts across LinkedIn, X, Instagram, YouTube, and newsletters. Built for B2B operators.',
  applicationName: 'Brand OS',
  keywords: ['personal branding', 'content creation', 'AI writing', 'LinkedIn', 'newsletter', 'voice to text'],
  authors: [{ name: 'Brand OS' }],
  creator: 'Brand OS',
  publisher: 'Brand OS',
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Brand OS',
    title: 'Brand OS — Operator stories, turned into a brand',
    description: 'The stories you tell over coffee, turned into a personal brand. Voice capture, AI translation, repurposing across every platform.',
    images: [
      {
        url: '/og.svg',
        width: 1200,
        height: 630,
        alt: 'Brand OS — Operator stories, turned into a brand'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Brand OS — Operator stories, turned into a brand',
    description: 'The stories you tell over coffee, turned into a personal brand.',
    images: ['/og.svg']
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' }
    ],
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.svg'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true }
  }
};

export const viewport = {
  themeColor: '#fafaf9',
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
