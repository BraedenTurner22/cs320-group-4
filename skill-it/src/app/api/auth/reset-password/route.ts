import { passwordReset } from '@/lib/services/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    await passwordReset(email)
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Password reset failed'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
