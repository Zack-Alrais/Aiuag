import type { Metadata, Viewport } from 'next';
import { Inter, Cairo } from 'next/font/google';
import AuthProvider from '@/components/auth/provider';
import ToasterProvider from '@/components/ui/toaster-provider';
import LanguageSync from '@/components/ui/language-sync';
import ThemeProvider from '@/components/theme/theme-provider';
import { PusherProvider } from '@/components/chat/pusher-provider';
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
      <body className="antialiased" suppressHydrationWarning>
        <AuthProvider>
          <ThemeProvider>
            <PusherProvider>
              <LanguageSync fontAr={cairo.className} fontEn={inter.className} />
              {children}
            </PusherProvider>
            <ToasterProvider />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
