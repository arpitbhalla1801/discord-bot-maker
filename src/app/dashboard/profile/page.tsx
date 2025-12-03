'use client'

import { FaDiscord, FaSignOutAlt, FaCog } from 'react-icons/fa'
import Image from 'next/image'

export default function ProfilePage() {
  // Mock user data - will be replaced with actual auth data later
  const isLoggedIn = false // Change to true to see logged-in state
  const user = {
    id: '123456789',
    name: 'Discord User',
    discriminator: '1234',
    avatar: 'https://cdn.discordapp.com/embed/avatars/0.png',
    email: 'user@example.com',
    createdAt: '2023-01-15',
  }

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center">
          <div className="card p-8">
            <div className="text-discord-blurple text-6xl mb-6 flex justify-center">
              <FaDiscord />
            </div>
            <h1 className="text-3xl font-bold mb-4">Sign In Required</h1>
            <p className="text-gray-300 mb-6">
              You need to sign in with Discord to access your profile and save your bots.
            </p>
            <button className="btn-primary w-full flex items-center justify-center gap-2 text-lg py-3">
              <FaDiscord />
              Login with Discord
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Profile</h1>
        
        {/* Profile Card */}
        <div className="card p-8 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
              <Image
                src={user.avatar}
                alt={user.name}
                width={128}
                height={128}
                className="rounded-full"
              />
              <div className="absolute -bottom-2 -right-2 bg-discord-green w-8 h-8 rounded-full border-4 border-discord-darkSecondary"></div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold mb-2">
                {user.name}
                <span className="text-gray-400 text-xl ml-2">#{user.discriminator}</span>
              </h2>
              <p className="text-gray-400 mb-4">{user.email}</p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <button className="btn-secondary flex items-center gap-2">
                  <FaCog />
                  Settings
                </button>
                <button className="btn-secondary flex items-center gap-2 bg-discord-red hover:bg-opacity-80">
                  <FaSignOutAlt />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="card p-6 mb-6">
          <h3 className="text-2xl font-bold mb-4">Account Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-700">
              <span className="text-gray-400">User ID</span>
              <span className="font-mono">{user.id}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-700">
              <span className="text-gray-400">Username</span>
              <span>{user.name}#{user.discriminator}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-700">
              <span className="text-gray-400">Email</span>
              <span>{user.email}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-400">Account Created</span>
              <span>{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Bots Section */}
        <div className="card p-6">
          <h3 className="text-2xl font-bold mb-4">Your Bots</h3>
          <p className="text-gray-400 text-center py-8">
            You haven't created any bots yet. 
            <a href="/builder" className="text-discord-blurple hover:underline ml-1">
              Start building one now!
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
