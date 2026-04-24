import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'JeopardyDowntime',
  description: 'Simple Jeopardy practice game for downtime moments',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
