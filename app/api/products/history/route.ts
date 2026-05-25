import { NextResponse } from 'next/server'
import { getPriceHistory } from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mlPublicId = searchParams.get('ml_public_id') ?? undefined
  const catalogId = searchParams.get('catalog_id') ?? undefined

  if (!mlPublicId && !catalogId) {
    return NextResponse.json({ error: 'ml_public_id or catalog_id is required' }, { status: 400 })
  }
  try {
    return NextResponse.json(await getPriceHistory({ ml_public_id: mlPublicId, catalog_id: catalogId }))
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
