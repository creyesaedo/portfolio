import { NextResponse } from 'next/server'
import { getCategories } from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  try {
    return NextResponse.json(await getCategories(searchParams.get('country') ?? undefined))
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
