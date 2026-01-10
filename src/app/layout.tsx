import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Permits Admin Dashboard',
  description: 'Admin dashboard for managing permits scrapers',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className='antialiased'>
        {children}
      </body>
    </html>
  );
}
