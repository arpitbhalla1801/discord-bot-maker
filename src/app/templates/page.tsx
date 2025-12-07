import React from 'react';
import Link from 'next/link';
import { FaRobot, FaGamepad, FaMusic, FaTools, FaShieldAlt, FaStar } from 'react-icons/fa';

export default function TemplatesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Bot Templates</h1>
      <p className="text-xl text-gray-300 mb-10">
        Start with a pre-configured template to speed up your bot development process.
        Choose from our collection of ready-to-use templates for various Discord bot purposes.
      </p>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Welcome Bot Template */}
        <div className="card p-6 flex flex-col">
          <div className="flex items-center mb-4">
            <div className="text-discord-blurple text-2xl mr-3">
              <FaRobot />
            </div>
            <h2 className="text-2xl font-semibold">Welcome Bot</h2>
          </div>
          <p className="text-gray-300 mb-6 flex-grow">
            A bot that greets new members with a custom welcome message and assigns
            default roles to new users who join your server.
          </p>
          <div className="flex justify-between mt-auto">
            <Link href="/preview/welcome-bot" className="btn-secondary text-sm px-4 py-2">
              Preview
            </Link>
            <Link href="/builder?template=welcome-bot" className="btn-primary text-sm px-4 py-2">
              Use Template
            </Link>
          </div>
        </div>

        {/* Moderation Bot Template */}
        <div className="card p-6 flex flex-col">
          <div className="flex items-center mb-4">
            <div className="text-discord-red text-2xl mr-3">
              <FaShieldAlt />
            </div>
            <h2 className="text-2xl font-semibold">Moderation Bot</h2>
          </div>
          <p className="text-gray-300 mb-6 flex-grow">
            Keep your server clean with moderation commands for kick, ban, mute,
            and message purging. Includes auto-moderation features.
          </p>
          <div className="flex justify-between mt-auto">
            <Link href="/preview/moderation-bot" className="btn-secondary text-sm px-4 py-2">
              Preview
            </Link>
            <Link href="/builder?template=moderation-bot" className="btn-primary text-sm px-4 py-2">
              Use Template
            </Link>
          </div>
        </div>

        {/* Music Bot Template */}
        <div className="card p-6 flex flex-col">
          <div className="flex items-center mb-4">
            <div className="text-discord-green text-2xl mr-3">
              <FaMusic />
            </div>
            <h2 className="text-2xl font-semibold">Music Bot</h2>
          </div>
          <p className="text-gray-300 mb-6 flex-grow">
            Play music from YouTube, Spotify, and SoundCloud in your voice channels.
            Includes queue management, volume control, and search functionality.
          </p>
          <div className="flex justify-between mt-auto">
            <Link href="/preview/music-bot" className="btn-secondary text-sm px-4 py-2">
              Preview
            </Link>
            <Link href="/builder?template=music-bot" className="btn-primary text-sm px-4 py-2">
              Use Template
            </Link>
          </div>
        </div>

        {/* Game Stats Bot Template */}
        <div className="card p-6 flex flex-col">
          <div className="flex items-center mb-4">
            <div className="text-discord-yellow text-2xl mr-3">
              <FaGamepad />
            </div>
            <h2 className="text-2xl font-semibold">Game Stats Bot</h2>
          </div>
          <p className="text-gray-300 mb-6 flex-grow">
            Display game statistics for popular games like Fortnite, Valorant, and
            League of Legends. Users can check their stats with simple commands.
          </p>
          <div className="flex justify-between mt-auto">
            <Link href="/preview/game-stats-bot" className="btn-secondary text-sm px-4 py-2">
              Preview
            </Link>
            <Link href="/builder?template=game-stats-bot" className="btn-primary text-sm px-4 py-2">
              Use Template
            </Link>
          </div>
        </div>

        {/* Utility Bot Template */}
        <div className="card p-6 flex flex-col">
          <div className="flex items-center mb-4">
            <div className="text-discord-purple text-2xl mr-3">
              <FaTools />
            </div>
            <h2 className="text-2xl font-semibold">Utility Bot</h2>
          </div>
          <p className="text-gray-300 mb-6 flex-grow">
            A multi-purpose bot with useful commands like polls, reminders, 
            server info, user info, and more everyday utilities.
          </p>
          <div className="flex justify-between mt-auto">
            <Link href="/preview/utility-bot" className="btn-secondary text-sm px-4 py-2">
              Preview
            </Link>
            <Link href="/builder?template=utility-bot" className="btn-primary text-sm px-4 py-2">
              Use Template
            </Link>
          </div>
        </div>

        {/* Community Bot Template */}
        <div className="card p-6 flex flex-col">
          <div className="flex items-center mb-4">
            <div className="text-discord-cyan text-2xl mr-3">
              <FaStar />
            </div>
            <h2 className="text-2xl font-semibold">Community Bot</h2>
          </div>
          <p className="text-gray-300 mb-6 flex-grow">
            Enhance community engagement with features like custom commands,
            reaction roles, leveling system, and user profiles.
          </p>
          <div className="flex justify-between mt-auto">
            <Link href="/preview/community-bot" className="btn-secondary text-sm px-4 py-2">
              Preview
            </Link>
            <Link href="/builder?template=community-bot" className="btn-primary text-sm px-4 py-2">
              Use Template
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center">
        <Link href="/dashboard" className="btn-primary text-lg px-8 py-3">
          Create Custom Bot
        </Link>
      </div>
    </div>
  );
}