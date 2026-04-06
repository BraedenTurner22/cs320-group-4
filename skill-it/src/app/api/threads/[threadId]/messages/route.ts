import { threads } from '@/lib/services/threads'
import { NextRequest, NextResponse } from 'next/server'

type Params = { params: Promise<{ threadId: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { threadId } = await params
    const messages = await threads.getMessages(Number(threadId))
    return NextResponse.json(messages)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to get messages'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { threadId } = await params
    const { content } = await req.json()
    const msg = await threads.sendMessage(Number(threadId), content)
    return NextResponse.json(msg, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to send message'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
