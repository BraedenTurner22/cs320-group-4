import { threads } from '@/lib/services/threads'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const data = await threads.getUnread()
    return NextResponse.json(data)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to get unread threads'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
