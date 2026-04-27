'use client'

import { useEffect, useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import type { Skill, Category, UserProfile } from '@/types'

const TOTAL_STEPS = 4

// --- Step indicator ---
function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
        const stepNum = i + 1
        const done = stepNum < current
        const active = stepNum === current
        return (
          <div key={i} className="flex items-center">
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                transition-all duration-300
                ${done ? 'bg-ember text-fg' : active ? 'bg-ember text-fg ring-4 ring-ember/30' : 'bg-raised border border-edge text-muted'}
              `}
            >
              {done ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                stepNum
              )}
            </div>
            {i < TOTAL_STEPS - 1 && (
              <div
                className={`w-12 h-0.5 transition-all duration-500 ${done ? 'bg-ember' : 'bg-edge'}`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// --- Slide wrapper ---
function Slide({ children, visible }: { children: React.ReactNode; visible: boolean }) {
  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        pointerEvents: visible ? 'auto' : 'none',
        position: visible ? 'relative' : 'absolute',
      }}
    >
      {children}
    </div>
  )
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [completing, setCompleting] = useState(false)
  const [completed, setCompleted] = useState(false)

  // Step 1 — Display name
  const [username, setUsername] = useState('')

  // Step 2 — Academic
  const [major, setMajor] = useState('')
  const [graduationYear, setGraduationYear] = useState('')

  // Step 3 — Bio
  const [bio, setBio] = useState('')

  // Step 4 — Skills + Categories
  const [allSkills, setAllSkills] = useState<Skill[]>([])
  const [userSkills, setUserSkills] = useState<Skill[]>([])
  const [selectedSkillId, setSelectedSkillId] = useState('')
  const [addingSkill, setAddingSkill] = useState(false)

  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])

  const [error, setError] = useState<string | null>(null)

  // Load initial data
  useEffect(() => {
    let cancelled = false
    async function load() {
      const [profileRes, skillsRes, catRes] = await Promise.all([
        fetch('/api/profile'),
        fetch('/api/skill'),
        fetch('/api/category'),
      ])
      if (cancelled) return
      if (profileRes.ok) {
        const p: UserProfile = await profileRes.json()
        setUsername(p.Username || '')
      }
      if (skillsRes.ok) setAllSkills(await skillsRes.json())
      if (catRes.ok) setAllCategories(await catRes.json())
    }
    load()
    return () => { cancelled = true }
  }, [])

  // ----- Skill helpers -----
  const availableSkills = allSkills.filter(
    s => !userSkills.some(u => u.id === s.id)
  )

  async function handleAddSkill() {
    if (!selectedSkillId) return
    setAddingSkill(true)
    try {
      const res = await fetch('/api/profile/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillId: selectedSkillId }),
      })
      if (res.ok) {
        const added = allSkills.find(s => s.id === Number(selectedSkillId))
        if (added) setUserSkills(prev => [...prev, added])
        setSelectedSkillId('')
      }
    } finally {
      setAddingSkill(false)
    }
  }

  async function handleRemoveSkill(skillId: number) {
    setUserSkills(prev => prev.filter(s => s.id !== skillId))
    await fetch(`/api/profile/skills?skillId=${skillId}`, { method: 'DELETE' })
  }

  // ----- Category helpers -----
  function toggleCategory(id: number) {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  // ----- Navigation -----
  function nextStep() {
    setError(null)
    if (step === 1 && !username.trim()) {
      setError('Please enter a display name.')
      return
    }
    if (step === 2 && !major.trim()) {
      setError('Please enter your major or field of study.')
      return
    }
    if (step === 2 && !graduationYear) {
      setError('Please enter your expected graduation year.')
      return
    }
    if (step === 3 && !bio.trim()) {
      setError('Please write a short bio so others can learn about you.')
      return
    }
    setStep(s => s + 1)
  }

  function prevStep() {
    setError(null)
    setStep(s => s - 1)
  }

  // ----- Final submit -----
  async function handleComplete(e: FormEvent) {
    e.preventDefault()
    setCompleting(true)
    setError(null)
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Username: username,
          Major: major,
          Graduation_Year: graduationYear ? parseInt(graduationYear, 10) : null,
          Description: bio,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to save profile')
      }
      setCompleted(true)
      setTimeout(() => router.push('/dashboard'), 1800)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setCompleting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-ember/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight">
            <span className="text-ember">Skill</span>
            <span className="text-fg">-It</span>
          </h1>
          <p className="text-muted text-sm mt-1">Let's set up your profile</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-edge bg-high/80 backdrop-blur-xl p-8 shadow-2xl shadow-black/30">
          {!completed ? (
            <>
              <StepBar current={step} />

              {/* Step 1 – Display Name */}
              {step === 1 && (
                <Slide visible>
                  <div className="flex flex-col gap-6">
                    <div>
                      <h2 className="text-2xl font-bold text-fg">Welcome! 👋</h2>
                      <p className="text-sm text-muted mt-1">
                        First, how should others see you on Skill-It?
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-muted">Display Name</label>
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && nextStep()}
                        className="text-sm text-fg rounded-lg border border-edge bg-raised px-3 py-2.5 outline-none focus:ring-2 focus:ring-ember/50 transition"
                        placeholder="How others will see you..."
                        autoFocus
                      />
                    </div>
                    {error && <p className="text-sm text-danger">{error}</p>}
                    <button
                      type="button"
                      onClick={nextStep}
                      className="w-full rounded-xl bg-ember hover:bg-ember/90 text-fg font-semibold py-2.5 px-4 transition-all duration-200 active:scale-95"
                    >
                      Continue →
                    </button>
                  </div>
                </Slide>
              )}

              {/* Step 2 – Academic Info */}
              {step === 2 && (
                <Slide visible>
                  <div className="flex flex-col gap-6">
                    <div>
                      <h2 className="text-2xl font-bold text-fg">Your Studies 📚</h2>
                      <p className="text-sm text-muted mt-1">
                        Tell us about your academic background.
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-muted">Major / Field of Study</label>
                      <input
                        type="text"
                        required
                        value={major}
                        onChange={e => setMajor(e.target.value)}
                        className="text-sm text-fg rounded-lg border border-edge bg-raised px-3 py-2.5 outline-none focus:ring-2 focus:ring-ember/50 transition"
                        placeholder="e.g. Computer Science"
                        autoFocus
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-muted">Expected Graduation Year</label>
                      <input
                        type="number"
                        required
                        value={graduationYear}
                        onChange={e => setGraduationYear(e.target.value)}
                        min="2020"
                        max="2035"
                        className="text-sm text-fg rounded-lg border border-edge bg-raised px-3 py-2.5 outline-none focus:ring-2 focus:ring-ember/50 transition"
                        placeholder="e.g. 2026"
                      />
                    </div>
                    {error && <p className="text-sm text-danger">{error}</p>}
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={prevStep}
                        className="flex-1 rounded-xl border border-edge bg-raised hover:bg-high text-fg font-semibold py-2.5 px-4 transition-all duration-200 active:scale-95"
                      >
                        ← Back
                      </button>
                      <button
                        type="button"
                        onClick={nextStep}
                        className="flex-[2] rounded-xl bg-ember hover:bg-ember/90 text-fg font-semibold py-2.5 px-4 transition-all duration-200 active:scale-95"
                      >
                        Continue →
                      </button>
                    </div>
                  </div>
                </Slide>
              )}

              {/* Step 3 – Bio */}
              {step === 3 && (
                <Slide visible>
                  <div className="flex flex-col gap-6">
                    <div>
                      <h2 className="text-2xl font-bold text-fg">About You ✍️</h2>
                      <p className="text-sm text-muted mt-1">
                        Write a short bio — what you're good at and what you're looking for.
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-muted">Short Bio</label>
                      <textarea
                        required
                        value={bio}
                        onChange={e => setBio(e.target.value)}
                        className="text-sm text-fg rounded-lg border border-edge bg-raised px-3 py-2.5 outline-none focus:ring-2 focus:ring-ember/50 min-h-[130px] resize-y transition"
                        placeholder="Tell people about yourself, your skills, and the types of gigs you're interested in..."
                        autoFocus
                      />
                      <p className="text-xs text-muted/60 text-right">{bio.length} chars</p>
                    </div>
                    {error && <p className="text-sm text-danger">{error}</p>}
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={prevStep}
                        className="flex-1 rounded-xl border border-edge bg-raised hover:bg-high text-fg font-semibold py-2.5 px-4 transition-all duration-200 active:scale-95"
                      >
                        ← Back
                      </button>
                      <button
                        type="button"
                        onClick={nextStep}
                        className="flex-[2] rounded-xl bg-ember hover:bg-ember/90 text-fg font-semibold py-2.5 px-4 transition-all duration-200 active:scale-95"
                      >
                        Continue →
                      </button>
                    </div>
                  </div>
                </Slide>
              )}

              {/* Step 4 – Skills + Job Categories */}
              {step === 4 && (
                <Slide visible>
                  <form onSubmit={handleComplete}>
                    <div className="flex flex-col gap-6">
                      <div>
                        <h2 className="text-2xl font-bold text-fg">Your Skills &amp; Interests 🛠️</h2>
                        <p className="text-sm text-muted mt-1">
                          Add your skills and the types of jobs you're interested in.
                        </p>
                      </div>

                      {/* Skills */}
                      <div className="flex flex-col gap-3">
                        <label className="text-sm font-medium text-muted">Your Skills</label>
                        <div className="flex flex-wrap gap-2 min-h-[36px]">
                          {userSkills.map(skill => (
                            <span
                              key={skill.id}
                              className="inline-flex items-center gap-1 rounded-full border border-edge bg-raised px-3 py-1.5 text-xs font-medium text-fg shadow-sm"
                            >
                              {skill.name}
                              <button
                                type="button"
                                onClick={() => handleRemoveSkill(skill.id)}
                                className="ml-1 text-muted hover:text-danger focus:outline-none leading-none"
                              >
                                &times;
                              </button>
                            </span>
                          ))}
                          {userSkills.length === 0 && (
                            <span className="text-xs text-muted/60 italic self-center">No skills added yet.</span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <select
                            value={selectedSkillId}
                            onChange={e => setSelectedSkillId(e.target.value)}
                            className="flex-1 text-sm text-fg rounded-lg border border-edge bg-raised px-3 py-2 outline-none focus:ring-2 focus:ring-ember/50"
                          >
                            <option value="">Select a skill to add...</option>
                            {availableSkills.map(s => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => { void handleAddSkill() }}
                            disabled={!selectedSkillId || addingSkill}
                            className="rounded-lg border border-edge bg-raised hover:bg-high text-fg text-sm font-medium px-4 py-2 transition disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {addingSkill ? '...' : 'Add'}
                          </button>
                        </div>
                      </div>

                      {/* Job Categories */}
                      <div className="flex flex-col gap-3 pt-4 border-t border-edge">
                        <label className="text-sm font-medium text-muted">
                          Interested in Jobs Like... <span className="text-muted/50 font-normal">(optional)</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {allCategories.map(cat => {
                            const active = selectedCategories.includes(cat.id)
                            return (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => toggleCategory(cat.id)}
                                className={`
                                  rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-150 active:scale-95
                                  ${active
                                    ? 'border-ember bg-ember/20 text-fg'
                                    : 'border-edge bg-raised text-muted hover:border-ember/50 hover:text-fg'}
                                `}
                              >
                                {active && <span className="mr-1">✓</span>}
                                {cat.name}
                              </button>
                            )
                          })}
                          {allCategories.length === 0 && (
                            <span className="text-xs text-muted/60 italic">No categories available.</span>
                          )}
                        </div>
                      </div>

                      {error && <p className="text-sm text-danger">{error}</p>}

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={prevStep}
                          className="flex-1 rounded-xl border border-edge bg-raised hover:bg-high text-fg font-semibold py-2.5 px-4 transition-all duration-200 active:scale-95"
                        >
                          ← Back
                        </button>
                        <button
                          type="submit"
                          disabled={completing}
                          className="flex-[2] rounded-xl bg-ember hover:bg-ember/90 text-fg font-semibold py-2.5 px-4 transition-all duration-200 active:scale-95 disabled:opacity-60"
                        >
                          {completing ? 'Saving...' : 'Complete Profile 🎉'}
                        </button>
                      </div>
                    </div>
                  </form>
                </Slide>
              )}
            </>
          ) : (
            /* ---- Completion screen ---- */
            <div className="flex flex-col items-center gap-6 py-6 text-center">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-success/20 border-2 border-success flex items-center justify-center animate-[ping_0.4s_ease-out_1]">
                </div>
                <div className="absolute inset-0 w-20 h-20 rounded-full bg-success/20 border-2 border-success flex items-center justify-center">
                  <svg className="w-10 h-10 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-fg">Profile Created!</h2>
                <p className="text-sm text-muted mt-2">
                  Welcome to Skill-It, {username}. Taking you to the dashboard...
                </p>
              </div>
              <div className="w-24 h-1 bg-edge rounded-full overflow-hidden">
                <div className="h-full bg-success rounded-full animate-[grow_1.8s_linear_forwards]" style={{ width: '100%', transformOrigin: 'left', animation: 'grow 1.8s linear forwards' }} />
              </div>
            </div>
          )}
        </div>

        {/* Step label */}
        {!completed && (
          <p className="text-center text-xs text-muted/50 mt-4">
            Step {step} of {TOTAL_STEPS}
          </p>
        )}
      </div>

      <style jsx>{`
        @keyframes grow {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
      `}</style>
    </div>
  )
}
