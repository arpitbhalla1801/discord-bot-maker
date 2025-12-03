import Link from 'next/link'
import { FaGithub, FaDiscord } from 'react-icons/fa'
import ProfileBadge from './ProfileBadge'

export default function Navbar() {
  // Mock auth state - will be replaced with actual auth later
  const isLoggedIn = false // Change to true to see logged-in state
  const user = {
    name: 'Discord User',
    avatar: 'https://cdn.discordapp.com/embed/avatars/0.png',
  }
  return (
    <nav className="bg-discord-darkBg border-b border-gray-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              Discord Bot Maker
            </Link>
            <div className="hidden md:flex ml-10 space-x-6">
              <Link href="/" className="nav-link">
                Home
              </Link>
              <Link href="/builder" className="nav-link">
                Builder
              </Link>
              <Link href="/templates" className="nav-link">
                Templates
              </Link>
              <Link href="/about" className="nav-link">
                About
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white"
            >
              <FaGithub className="text-xl" />
            </a>
            <a 
              href="https://discord.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white"
            >
              <FaDiscord className="text-xl" />
            </a>
            {!isLoggedIn && (
              <Link 
                href="/builder" 
                className="btn-primary hidden md:block"
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
