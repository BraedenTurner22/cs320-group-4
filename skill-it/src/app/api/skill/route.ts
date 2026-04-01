import { skill } from '@/lib/services/skills'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const data = await skill.getAll()
    return NextResponse.json(data)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch skills'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, explicit } = await req.json()
    const created = await skill.create(name, explicit ?? false)
    return NextResponse.json(created, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create skill'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
