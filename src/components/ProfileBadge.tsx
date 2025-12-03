'use client'

import Link from 'next/link'
import Image from 'next/image'
import { FaDiscord, FaUser } from 'react-icons/fa'
import { signIn } from '@/lib/auth-client'

interface ProfileBadgeProps {
  isLoggedIn?: boolean
  user?: {
    name: string
    avatar: string
  }
}

export default function ProfileBadge({ isLoggedIn = false, user }: ProfileBadgeProps) {
  const handleSignIn = async () => {
    await signIn.social({
      provider: "discord",
      callbackURL: "/dashboard/profile",
    })
  }

  if (!isLoggedIn) {
    return (
      <button onClick={handleSignIn} className="btn-primary flex items-center gap-2">
        <FaDiscord />
        <span className="hidden md:inline">Login with Discord</span>
        <span className="md:hidden">Login</span>
      </button>
    )
  }

  return (
    <Link 
      href="/dashboard/profile" 
      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
    >
      <span className="hidden md:inline text-sm font-medium">{user?.name}</span>
      <div className="relative">
        {user?.avatar ? (
          <Image
            src={user.avatar}
            alt={user.name || 'Profile'}
            width={40}
            height={40}
            className="rounded-full border-2 border-discord-blurple"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-discord-blurple flex items-center justify-center border-2 border-discord-blurple">
            <FaUser className="text-white" />
          </div>
        )}
        <div className="absolute -bottom-1 -right-1 bg-discord-green w-3 h-3 rounded-full border-2 border-discord-darkBg"></div>
      </div>
    </Link>
  )
}
