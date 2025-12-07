import Link from 'next/link'
import { FaGithub, FaDiscord, FaHeart } from 'react-icons/fa'

export default function Footer() {
  return (
    <footer className="bg-discord-darkBg border-t border-gray-700/50 mt-auto">
      <div className="container mx-auto px-4 lg:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span>🤖</span>
              Discord Bot Maker
            </h3>
            <p className="text-discord-text-secondary leading-relaxed mb-6">
              The easiest way to create powerful Discord bots without writing code.
            </p>
            <div className="flex gap-3">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-3 rounded-lg bg-discord-darkSecondary hover:bg-discord-darkHover text-discord-text-secondary hover:text-white transition-all"
                aria-label="GitHub"
              >
                <FaGithub className="text-xl" />
              </a>
              <a 
                href="https://discord.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-3 rounded-lg bg-discord-darkSecondary hover:bg-discord-blurple text-discord-text-secondary hover:text-white transition-all"
                aria-label="Discord"
              >
                <FaDiscord className="text-xl" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4 text-white">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-discord-text-secondary hover:text-discord-blurple transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-discord-text-secondary hover:text-discord-blurple transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/templates" className="text-discord-text-secondary hover:text-discord-blurple transition-colors">
                  Templates
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-discord-text-secondary hover:text-discord-blurple transition-colors">
                  Documentation
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4 text-white">Resources</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="https://discord.js.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-discord-text-secondary hover:text-discord-blurple transition-colors"
                >
                  Discord.js Guide
                </a>
              </li>
              <li>
                <a 
                  href="https://discord.com/developers/docs" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-discord-text-secondary hover:text-discord-blurple transition-colors"
                >
                  Discord API Docs
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-discord-text-secondary hover:text-discord-blurple transition-colors"
                >
                  GitHub Repository
                </a>
              </li>
              <li>
                <Link href="/docs" className="text-discord-text-secondary hover:text-discord-blurple transition-colors">
                  Tutorials
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 text-white">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/docs" className="text-discord-text-secondary hover:text-discord-blurple transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <a 
                  href="https://discord.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-discord-text-secondary hover:text-discord-blurple transition-colors"
                >
                  Community Discord
                </a>
              </li>
              <li>
                <Link href="/docs" className="text-discord-text-secondary hover:text-discord-blurple transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-discord-text-secondary hover:text-discord-blurple transition-colors"
                >
                  Report Issues
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-discord-text-muted text-sm">
            © {new Date().getFullYear()} Discord Bot Maker. All rights reserved.
          </p>
          <p className="text-discord-text-muted text-sm flex items-center gap-2">
            Made with <FaHeart className="text-discord-red animate-pulse" /> by developers, for developers
          </p>
        </div>
      </div>
    </footer>
  )
}
