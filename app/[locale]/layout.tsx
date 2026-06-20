import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { LOCALES, type Locale } from '@/lib/i18n'

export const metadata: Metadata = {
  title: 'Cristian Alejandro Reyes Aedo — Portfolio - Portafolio',
  description: 'Backend Engineer — NestJS, PostgreSQL, TypeScript. Ingeniero de Backend — NestJS, PostgreSQL, TypeScript.',
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
  if (!LOCALES.includes(locale)) notFound()
  return (
    <html lang={locale}>
      <body>
        <Navbar locale={locale} />
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  )
}
