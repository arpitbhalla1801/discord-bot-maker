import Link from 'next/link'
import Image from 'next/image'
import { FaRobot, FaCode, FaDownload } from 'react-icons/fa'

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="text-center py-16">
        <h1 className="text-5xl font-bold mb-6">Discord Bot Maker</h1>
        <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
          A no-code web-based platform that allows users to create fully functional 
          Discord bots using a visual UI — no programming required.
        </p>
        <Link 
          href="/dashboard" 
          className="btn-primary text-lg px-8 py-3"
        >
          Start Building
        </Link>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <h2 className="text-3xl font-bold text-center mb-12">What You Can Do</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="card flex flex-col items-center text-center">
            <div className="text-discord-blurple text-4xl mb-4">
              <FaRobot />
            </div>
            <h3 className="text-xl font-semibold mb-2">Design Custom Commands</h3>
            <p className="text-gray-300">Create slash commands with customizable options and responses.</p>
          </div>
          
          <div className="card flex flex-col items-center text-center">
            <div className="text-discord-green text-4xl mb-4">
              <FaCode />
            </div>
            <h3 className="text-xl font-semibold mb-2">Instant Code Generation</h3>
            <p className="text-gray-300">Get production-ready discord.js code without writing anything yourself.</p>
          </div>
          
          <div className="card flex flex-col items-center text-center">
            <div className="text-discord-yellow text-4xl mb-4">
              <FaDownload />
            </div>
            <h3 className="text-xl font-semibold mb-2">Easy Self-Hosting</h3>
            <p className="text-gray-300">Download your bot and host it anywhere with simple instructions.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to Create Your Bot?</h2>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          No coding experience needed. Start building your Discord bot in minutes.
        </p>
        <Link 
          href="/dashboard" 
          className="btn-primary text-lg px-8 py-3"
        >
          Get Started
        </Link>
      </section>
    </div>
  )
}
