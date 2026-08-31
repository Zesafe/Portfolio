import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Yassine Abousaid | Portfolio',
  description:
    'CS student at TU Dortmund — hardware logic, algorithms, and modern web interfaces.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="light">
      <body>{children}</body>
    </html>
  );
}