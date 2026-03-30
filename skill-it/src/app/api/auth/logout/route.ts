import { account } from '@/lib/services/auth'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    await account.logOut()
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Logout failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
