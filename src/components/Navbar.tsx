'use client'

import Link from 'next/link'
import { FaGithub, FaDiscord } from 'react-icons/fa'
import ProfileBadge from './ProfileBadge'
import { useSession } from '@/lib/auth-client'

export default function Navbar() {
  const { data: session } = useSession()
  const isLoggedIn = !!session?.user
  const user = session?.user ? {
    name: session.user.name || 'Discord User',
    avatar: session.user.image || 'https://cdn.discordapp.com/embed/avatars/0.png',
  } : undefined
  return (
    <nav className="sticky top-0 z-50 bg-discord-darkBg/95 backdrop-blur-md border-b border-gray-700/50 shadow-lg">
      <div className="container mx-auto px-4 lg:px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-10">
            <Link href="/" className="text-xl font-bold text-white hover:text-discord-blurple transition-colors flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              <span className="hidden sm:inline">Discord Bot Maker</span>
              <span className="sm:hidden">DBM</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="nav-link py-2">
                Home
              </Link>
              <Link href="/dashboard" className="nav-link py-2">
                Dashboard
              </Link>
              <Link href="/templates" className="nav-link py-2">
                Templates
              </Link>
              <Link href="/docs" className="nav-link py-2">
                Docs
              </Link>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-discord-text-secondary hover:text-white p-2 rounded-lg hover:bg-discord-darkHover transition-all"
              aria-label="GitHub"
            >
              <FaGithub className="text-xl" />
            </a>
            <a 
              href="https://discord.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-discord-text-secondary hover:text-discord-blurple p-2 rounded-lg hover:bg-discord-darkHover transition-all"
              aria-label="Discord"
            >
              <FaDiscord className="text-xl" />
            </a>
            {!isLoggedIn && (
              <Link 
                href="/dashboard" 
                className="btn-primary hidden md:inline-flex text-sm"
              >
                Start Building
              </Link>
            )}
            <ProfileBadge isLoggedIn={isLoggedIn} user={user} />
          </div>
        </div>
      </div>
    </nav>
  )
}
