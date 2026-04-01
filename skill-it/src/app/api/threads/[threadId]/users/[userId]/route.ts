import { threads } from '@/lib/services/threads'
import { NextRequest, NextResponse } from 'next/server'

type Params = { params: Promise<{ threadId: string; userId: string }> }

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { threadId, userId } = await params
    await threads.removeUser(Number(threadId), Number(userId))
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to remove user'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
