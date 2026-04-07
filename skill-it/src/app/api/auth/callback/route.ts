import { handleCallback } from '@/lib/services/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get('code')
    if (!code) {
      return NextResponse.json({ error: 'Missing code parameter' }, { status: 400 })
    }
    const session = await handleCallback(code)
    return NextResponse.json(session)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Callback failed'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
