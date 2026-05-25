import { NextResponse } from 'next/server'
import { getProducts } from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  try {
    const result = await getProducts({
      page: searchParams.get('page') ? Number(searchParams.get('page')) : undefined,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
      country: searchParams.get('country') ?? undefined,
      category_id: searchParams.get('category_id') ? Number(searchParams.get('category_id')) : undefined,
      date_from: searchParams.get('date_from') ?? undefined,
      date_to: searchParams.get('date_to') ?? undefined,
      search: searchParams.get('search') ?? undefined,
    })
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
