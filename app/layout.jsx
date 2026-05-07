import './globals.css';

export const metadata = {
  title: 'Brand OS — Personal Brand Platform',
  description: 'Built on a proven personal-brand framework: relatable beats impressive.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
