import { threads } from '@/lib/services/threads'
import { NextRequest, NextResponse } from 'next/server'

type Params = { params: Promise<{ threadId: string; messageId: string }> }

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { threadId, messageId } = await params
    await threads.deleteMessage(Number(threadId), Number(messageId))
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete message'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
