'use client'

import { useEffect, useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import type { Skill, UserProfile } from '@/types'

export default function EditProfilePage() {
  const router = useRouter()
  
  const [username, setUsername] = useState('')
  const [major, setMajor] = useState('')
  const [graduationYear, setGraduationYear] = useState('')
  const [bio, setBio] = useState('')

  //Skills
  const [allSkills, setAllSkills] = useState<Skill[]>([])
  const [userSkills, setUserSkills] = useState<Skill[]>([])
  const [selectedSkillId, setSelectedSkillId] = useState('')
  const [addingSkill, setAddingSkill] = useState(false)
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Existing Profile
  useEffect(() => {
    let cancelled = false
    async function loadData() {
      try {
        const [profileRes, allSkillsRes, userSkillsRes] = await Promise.all([
          fetch('/api/profile'),
          fetch('/api/skill'),
          fetch('/api/profile/skills')
        ])

        if (!cancelled) {
          if (profileRes.ok) {
            const data: UserProfile = await profileRes.json()
            setUsername(data.Username || '')
            setMajor(data.Major || '') 
            setGraduationYear(data.Graduation_Year ? String(data.Graduation_Year) : '')
            setBio(data.Description || '') 
          }
          if (allSkillsRes.ok) setAllSkills(await allSkillsRes.json())
          if (userSkillsRes.ok) setUserSkills(await userSkillsRes.json())
        }
      } catch {
        if (!cancelled) setError('Failed to load profile data.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadData()

    return () => { cancelled = true }
  }, [])

  async function handleAddSkill() {
    if (!selectedSkillId) return
    setAddingSkill(true)
    try {
      const res = await fetch('/api/profile/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillId: selectedSkillId })
      })
      
      if (res.ok) {
        const addedSkill = allSkills.find(s => s.id === Number(selectedSkillId))
        if (addedSkill) {
          setUserSkills([...userSkills, addedSkill])
        }
        setSelectedSkillId('') 
      }
    } finally {
      setAddingSkill(false)
    }
  }

  async function handleRemoveSkill(skillId: number) {
    try {
      
      setUserSkills(userSkills.filter(s => s.id !== skillId))
      await fetch(`/api/profile/skills?skillId=${skillId}`, { method: 'DELETE' })
    } catch {
      console.error('Failed to remove skill')
    }
  }

  // Dropdown
  const availableSkillsToAdd = allSkills.filter(
    skill => !userSkills.some(userSkill => userSkill.id === skill.id)
  )

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const payload = {
        Username: username,
        Major: major, 
        Graduation_Year: graduationYear ? parseInt(graduationYear, 10) : null,
        Description: bio, 
      }

      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to update profile')
      }

      setSuccess(true)
      
      // Timeout redirect
      setTimeout(() => {
        router.push('/dashboard') 
      }, 1500)

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-lg py-8 text-center">
        <p className="text-sm text-muted/70">Loading…</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg flex flex-col gap-8 pb-12">
      <div>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-muted hover:text-ember transition-colors"
        >
          ← Back
        </Link>
        <h1 className="mt-4 text-3xl font-extrabold text-fg tracking-tight">Edit Details</h1>
        <p className="mt-1 text-sm text-muted">
          Update your personal information and bio.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 rounded-2xl border border-edge bg-high/80 p-8 shadow-lg shadow-black/15">
        
        {/* Username Field */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-muted">Display Name</label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="text-sm text-fg rounded-lg border border-edge bg-raised px-3 py-2 outline-none focus:ring-2 focus:ring-ember/50"
            placeholder="How others see you..."
          />
        </div>

        {/* Major Field */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-muted">Major / Field of Study</label>
          <input
            type="text"
            value={major}
            onChange={(e) => setMajor(e.target.value)}
            className="text-sm text-fg rounded-lg border border-edge bg-raised px-3 py-2 outline-none focus:ring-2 focus:ring-ember/50"
            placeholder="e.g. Computer Science"
          />
        </div>

        {/* Graduation Year Field */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-muted">Graduation Year</label>
          <input
            type="number"
            value={graduationYear}
            onChange={(e) => setGraduationYear(e.target.value)}
            min="1950"
            max="2030"
            className="text-sm text-fg rounded-lg border border-edge bg-raised px-3 py-2 outline-none focus:ring-2 focus:ring-ember/50"
            placeholder="YYYY"
          />
        </div>

        {/* Bio Field */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-muted">Short Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="text-sm text-fg rounded-lg border border-edge bg-raised px-3 py-2 outline-none focus:ring-2 focus:ring-ember/50 min-h-[120px] resize-y"
            placeholder="Tell people a little about yourself, your skills, and what you are looking for..."
          />
        </div>

        {/* --- Skills Section (Saves Instantly) --- */}
        <div className="flex flex-col gap-4 pt-6 border-t border-edge">
          <label className="text-sm font-medium text-muted">Your Skills</label>
          
          {/* Active Skills Badges */}
          <div className="flex flex-wrap gap-2">
            {userSkills.map((skill) => (
              <span key={skill.id} className="inline-flex items-center gap-1 rounded-full border border-edge bg-raised px-3 py-1.5 text-xs font-medium text-fg shadow-sm">
                {skill.name}
                <button type="button" onClick={() => handleRemoveSkill(skill.id)} className="ml-1 text-muted hover:text-danger focus:outline-none">
                  &times;
                </button>
              </span>
            ))}
            {userSkills.length === 0 && <span className="text-sm text-muted/60 italic">No skills added yet.</span>}
          </div>

          {/* Add Skill Dropdown */}
          <div className="flex gap-3">
            <select
              value={selectedSkillId}
              onChange={(e) => setSelectedSkillId(e.target.value)}
              className="flex-1 text-sm text-fg rounded-lg border border-edge bg-raised px-3 py-2 outline-none focus:ring-2 focus:ring-ember/50"
            >
              <option value="">Select a skill to add...</option>
              {availableSkillsToAdd.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            
            {/* We use type="button" so it doesn't trigger the main form save! */}
            <Button type="button" onClick={() => { void handleAddSkill() }} disabled={!selectedSkillId || addingSkill}>
              {addingSkill ? 'Adding...' : 'Add'}
            </Button>
          </div>
        </div>

        {/* Status Messages */}
        {error && <p className="text-sm text-danger font-medium">{error}</p>}
        {success && <p className="text-sm text-success font-medium">Profile updated successfully!</p>}

        {/* Submit Button */}
        <div className="pt-2">
          <Button type="submit" disabled={saving} className="w-full">
            {saving ? 'Saving changes...' : 'Save Profile'}
          </Button>
        </div>
      </form>
      
      {/* Helpful Link to Picture Edit */}
      <div className="text-center">
        <Link 
          href="/profile/picture" 
          className="text-sm text-muted hover:text-ember transition-colors font-medium"
        >
          Want to update your profile picture instead?
        </Link>
      </div>
    </div>
  )
}