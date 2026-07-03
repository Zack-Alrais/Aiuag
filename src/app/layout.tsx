import type { Metadata, Viewport } from 'next';
import { Inter, Cairo } from 'next/font/google';
import AuthProvider from '@/components/auth/provider';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const cairo = Cairo({ subsets: ['arabic', 'latin'], variable: '--font-cairo' });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'رابطة خريجي جامعة أفريقيا العالمية - AIUAG',
  description: 'رابطة مهنية واجتماعية تجمع خريجي جامعة أفريقيا العالمية وتعزز الروابط بينهم',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={cairo.className}>
      <body className="antialiased">
        <AuthProvider>
          {children}
          <Toaster
            position="top-left"
            richColors
            closeButton
            dir="rtl"
            toastOptions={{
              className: 'dark:bg-dark-surface dark:text-white dark:border-dark-border',
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
