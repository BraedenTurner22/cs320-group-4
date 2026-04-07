import { threads } from '@/lib/services/threads'
import { NextRequest, NextResponse } from 'next/server'

type Params = { params: Promise<{ threadId: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { threadId } = await params
    const thread = await threads.getOneByID(Number(threadId))
    return NextResponse.json(thread)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Thread not found'
    return NextResponse.json({ error: message }, { status: 404 })
  }
}

export async function PATCH(_req: NextRequest, { params }: Params) {
  try {
    const { threadId } = await params
    await threads.archive(Number(threadId))
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to archive thread'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { threadId } = await params
    const { name } = await req.json()
    const thread = await threads.rename(Number(threadId), name)
    return NextResponse.json(thread)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to rename thread'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
