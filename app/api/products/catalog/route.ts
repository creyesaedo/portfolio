import { NextResponse } from 'next/server'
import { getCatalogProducts } from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') ?? ''
  if (search.trim().length < 2) {
    return NextResponse.json({ error: 'search must be at least 2 characters' }, { status: 400 })
  }
  try {
    return NextResponse.json(await getCatalogProducts(search.trim()))
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
