import { updatePassword } from '@/lib/services/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json()
    const user = await updatePassword(password)
    return NextResponse.json(user)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Password update failed'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
