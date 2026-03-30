import { threads } from '@/lib/services/threads'
import { NextRequest, NextResponse } from 'next/server'

type Params = { params: Promise<{ threadId: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { threadId } = await params
    const users = await threads.getUsers(Number(threadId))
    return NextResponse.json(users)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to get users'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { threadId } = await params
    const { userId } = await req.json()
    const thread = await threads.addUser(Number(threadId), userId)
    return NextResponse.json(thread)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to add user'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
