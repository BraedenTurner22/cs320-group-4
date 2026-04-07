import { threads } from '@/lib/services/threads'
import { NextRequest, NextResponse } from 'next/server'

function normalizeLastRead(input: unknown): Record<number, number> {
  if (!input || typeof input !== 'object') return {}
  const out: Record<number, number> = {}
  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    const id = Number(k)
    const n = Number(v)
    if (!Number.isFinite(id) || !Number.isFinite(n)) continue
    out[id] = n
  }
  return out
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const lastRead = normalizeLastRead(body.lastRead)
    const counts = await threads.getUnreadCounts(lastRead)
    const stringKeyed: Record<string, number> = {}
    for (const [k, v] of Object.entries(counts)) {
      stringKeyed[k] = v
    }
    return NextResponse.json({ counts: stringKeyed })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load unread counts'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
