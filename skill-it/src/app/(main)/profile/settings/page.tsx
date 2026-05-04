import Link from 'next/link'

export default function ProfileSettingsPage() {
  return (
    <div className="mx-auto max-w-lg py-8">
      <Link
        href="/dashboard"
        className="text-sm font-medium text-muted hover:text-ember-text transition-colors"
      >
        ← Back
      </Link>
      <h1 className="mt-4 text-3xl font-extrabold text-fg tracking-tight">Settings</h1>
      <p className="mt-2 text-sm text-muted">Nothing here yet.</p>
    </div>
  )
}
