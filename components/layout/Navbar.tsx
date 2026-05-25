'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Github } from 'lucide-react'
import { t, type Locale, LOCALES } from '@/lib/i18n'

function LocaleSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname()
  return (
    <div className="flex items-center gap-1">
      {LOCALES.map((l) => {
        const href = pathname.replace(`/${locale}`, `/${l}`)
        const isActive = l === locale
        return (
          <Link
            key={l}
            href={href}
            className={
              isActive
                ? 'text-xs font-mono font-semibold text-white border border-zinc-600 rounded px-2 py-0.5'
                : 'text-xs font-mono text-zinc-500 hover:text-white border border-transparent hover:border-zinc-700 rounded px-2 py-0.5 transition-colors'
            }
          >
            {l.toUpperCase()}
          </Link>
        )
      })}
    </div>
  )
}

export function Navbar({ locale }: { locale: Locale }) {
  const tr = t(locale)
  return (
    <nav className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link
          href={`/${locale}`}
          className="text-sm font-bold text-white hover:text-zinc-300 transition-colors tracking-tight"
        >
          CR
        </Link>
        <div className="flex items-center gap-4 text-sm text-zinc-400">
          <Link href={`/${locale}`} className="hover:text-white transition-colors">
            {tr.nav.projects}
          </Link>
          <a
            href="https://github.com/creyesaedo"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
            aria-label="GitHub"
          >
            <Github className="w-4 h-4" />
          </a>
          <LocaleSwitcher locale={locale} />
        </div>
      </div>
    </nav>
  )
}
