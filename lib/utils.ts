import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const CURRENCY_MAP: Record<string, string> = {
  MLC: 'CLP', MLA: 'ARS', MLB: 'BRL', MLM: 'MXN',
  MCO: 'COP', MPE: 'PEN', MLU: 'UYU', MLV: 'VES',
}

export function formatPrice(price: string | number, country: string | null): string {
  const num = typeof price === 'string' ? parseFloat(price) : price
  const currency = (country && CURRENCY_MAP[country]) || 'USD'
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(num)
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatNumber(n: number | null | undefined): string {
  if (n == null) return '—'
  return new Intl.NumberFormat('es-CL').format(n)
}
