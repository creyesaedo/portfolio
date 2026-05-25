import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { LOCALES, type Locale } from '@/lib/i18n'

export const metadata: Metadata = {
  title: 'Cristian Reyes — Portfolio',
  description: 'Backend Engineer — NestJS, PostgreSQL, TypeScript',
}

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  return (
    <html lang={locale}>
      <body>
        <Navbar locale={locale} />
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  )
}
