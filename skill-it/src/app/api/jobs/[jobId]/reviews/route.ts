import { NextRequest, NextResponse } from 'next/server'

type Params = { params: Promise<{ jobId: string }> }

// NOTE: No Review table exists in the current Supabase schema
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await params
    return NextResponse.json({ error: 'Review table not yet available' }, { status: 501 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to get reviews'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
