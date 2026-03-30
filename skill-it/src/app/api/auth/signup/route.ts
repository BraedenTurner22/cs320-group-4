import { account } from '@/lib/services/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    const user = await account.signUp(email, password)
    return NextResponse.json(user, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Signup failed'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
