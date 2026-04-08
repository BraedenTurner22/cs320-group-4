'use client'

import { useEffect, useState } from 'react'
import { profileInitials } from '@/lib/profile-initials'

const sizePx = { sm: 32, md: 40, lg: 96, xl: 128 } as const

type ProfileAvatarProps = {
  name: string
  imageUrl?: string | null
  size?: keyof typeof sizePx
  className?: string
}

export default function ProfileAvatar({
  name,
  imageUrl,
  size = 'md',
  className = '',
}: ProfileAvatarProps) {
  const [imgFailed, setImgFailed] = useState(false)

  useEffect(() => {
    setImgFailed(false)
  }, [imageUrl])

  const px = sizePx[size]
  const showImg = Boolean(imageUrl && !imgFailed)
  const initials = profileInitials(name || '?')

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-edge bg-raised text-fg ${className}`}
      style={{ width: px, height: px }}
    >
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={imageUrl}
          src={imageUrl!}
          alt=""
          width={px}
          height={px}
          className="size-full object-cover"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <span
          className={`font-bold text-muted ${
            size === 'xl' ? 'text-3xl' : size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-xs' : 'text-sm'
          }`}
        >
          {initials}
        </span>
      )}
    </span>
  )
}
