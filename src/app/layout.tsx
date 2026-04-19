import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Paperpigeon',
  description: 'A private space for two people to share thoughts that disappear.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
