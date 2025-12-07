import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-discord-darkBg border-t border-gray-700 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Discord Bot Maker</h3>
            <p className="text-gray-400">
              Create custom Discord bots without coding. Design, preview, and deploy with ease.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-400 hover:text-white">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/templates" className="text-gray-400 hover:text-white">
                  Templates
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-gray-400 hover:text-white">
                  Docs
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://discord.js.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white"
                >
                  Discord.js Docs
                </a>
              </li>
              <li>
                <a 
                  href="https://discord.com/developers/docs" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white"
                >
                  Discord API
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white"
                >
                  GitHub Repository
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-500">
          <p>© {new Date().getFullYear()} Discord Bot Maker. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
