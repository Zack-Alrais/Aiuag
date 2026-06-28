import type { Metadata } from 'next';
import LayoutShell from './layout-shell';

export async function generateStaticParams() {
  return [{ lang: 'ar' }, { lang: 'en' }];
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const title = lang === 'ar'
    ? 'رابطة خريجي جامعة أفريقيا العالمية - AIUAG'
    : 'Association of IUA Graduates - AIUAG';

  const description = lang === 'ar'
    ? 'رابطة مهنية واجتماعية تجمع خريجي جامعة أفريقيا العالمية وتعزز الروابط بينهم لخدمة المجتمع والتنمية'
    : 'A professional and social association that brings together graduates of Africa International University and strengthens bonds between them';

  return {
    title,
    description,
    keywords: lang === 'ar'
      ? 'رابطة خريجي جامعة أفريقيا العالمية, خريجين, جامعة أفريقيا, AIUAG, الخرطوم, السودان'
      : 'Alumni Association, Africa International University, AIUAG, Khartoum, Sudan',
  };
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  return (
    <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <LayoutShell lang={lang}>{children}</LayoutShell>
    </div>
  );
}
