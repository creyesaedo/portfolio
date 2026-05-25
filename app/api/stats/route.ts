import { NextResponse } from 'next/server'
import { getStats } from '@/lib/db'

export async function GET() {
  try {
    return NextResponse.json(await getStats())
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
