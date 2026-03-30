import { account } from '@/lib/services/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    const session = await account.logIn(email, password)
    return NextResponse.json(session)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Login failed'
    return NextResponse.json({ error: message }, { status: 401 })
  }
}
