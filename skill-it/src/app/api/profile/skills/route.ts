import { NextResponse, NextRequest } from 'next/server'
import { profile } from '@/lib/services/profile'

export async function GET() {
  try {
    const current = await profile.getCurrent()
    const skills = await profile.getSkills(current.id)
    return NextResponse.json(skills)
  } catch {
    return NextResponse.json({ error: 'Failed loading profile' }, { status: 401 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const current = await profile.getCurrent()
    const { skillId } = await req.json()
    await profile.addSkill(current.id, Number(skillId))
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Could not add skill.' }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const current = await profile.getCurrent()
    const { searchParams } = new URL(req.url)
    const skillId = searchParams.get('skillId')
    
    if (!skillId) throw new Error('Missing skillId')
    
    await profile.removeSkill(current.id, Number(skillId))
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Could not remove skill' }, { status: 400 })
  }
}