import { threads } from '@/lib/services/threads'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const data = await threads.getMessagingMeta()
    return NextResponse.json(data)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load messaging meta'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
