'use client'

import Link from 'next/link'
import Image from 'next/image'
import { FaDiscord, FaUser, FaSignInAlt } from 'react-icons/fa'
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
    try {
      const data = await signIn.social({
        provider: "discord",
        callbackURL: window.location.pathname === '/' ? '/dashboard/profile' : window.location.pathname,
        fetchOptions: {
          onSuccess: () => {
            // Force a client-side navigation after successful auth
            window.location.href = window.location.pathname === '/' ? '/dashboard/profile' : window.location.pathname
          }
        }
      })
    } catch (error) {
      console.error('Sign in failed:', error)
    }
  }

  if (!isLoggedIn) {
    return (
      <button 
        onClick={handleSignIn} 
        className="btn-primary flex items-center gap-2 text-sm group"
      >
        <FaDiscord className="text-lg group-hover:rotate-12 transition-transform duration-300" />
        <span className="hidden sm:inline">Login with Discord</span>
        <span className="sm:hidden">Login</span>
      </button>
    )
  }

  return (
    <Link 
      href="/dashboard/profile" 
      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-discord-darkHover transition-all group"
    >
      <span className="hidden md:inline text-sm font-medium text-discord-text-primary group-hover:text-discord-blurple transition-colors">
        {user?.name}
      </span>
      <div className="relative">
        {user?.avatar ? (
          <Image
            src={user.avatar}
            alt={user.name || 'Profile'}
            width={40}
            height={40}
            className="rounded-full border-2 border-discord-blurple group-hover:border-discord-blurpleHover transition-all ring-2 ring-discord-blurple/0 group-hover:ring-discord-blurple/30"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-discord-blurple group-hover:bg-discord-blurpleHover flex items-center justify-center border-2 border-discord-blurple transition-all">
            <FaUser className="text-white" />
          </div>
        )}
        <div className="absolute -bottom-0.5 -right-0.5 bg-discord-green w-3.5 h-3.5 rounded-full border-2 border-discord-darkBg group-hover:scale-110 transition-transform"></div>
      </div>
    </Link>
  )
}
