import Link from 'next/link'
import Image from 'next/image'
import { FaRobot, FaCode, FaDownload, FaRocket, FaPuzzlePiece, FaShieldAlt } from 'react-icons/fa'

export default function Home() {
  return (
    <div className="container mx-auto px-4 lg:px-6">
      {/* Hero Section */}
      <section className="text-center py-20 lg:py-32 animate-fade-in">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 bg-gradient-to-r from-discord-blurple via-discord-fuchsia to-discord-green bg-clip-text text-transparent leading-tight">
            Discord Bot Maker
          </h1>
          <p className="text-xl md:text-2xl text-discord-text-secondary mb-10 max-w-3xl mx-auto leading-relaxed">
            A powerful no-code platform to create fully functional 
            Discord bots with a visual interface — no programming required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/dashboard" 
              className="btn-primary text-lg px-10 py-4 inline-flex items-center gap-2"
            >
              <FaRocket />
              Start Building Free
            </Link>
            <Link 
              href="/templates" 
              className="btn-secondary text-lg px-10 py-4 inline-flex items-center gap-2"
            >
              <FaPuzzlePiece />
              Browse Templates
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 animate-slide-up">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Build Powerful Bots Effortlessly</h2>
          <p className="text-discord-text-secondary text-lg max-w-2xl mx-auto">
            Everything you need to create, customize, and deploy Discord bots
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <div className="card group">
            <div className="text-discord-blurple text-5xl mb-5 transform group-hover:scale-110 transition-transform duration-300">
              <FaRobot />
            </div>
            <h3 className="text-2xl font-bold mb-3">Design Custom Commands</h3>
            <p className="text-discord-text-secondary leading-relaxed">
              Create powerful slash commands with customizable options, permissions, and interactive responses using our visual editor.
            </p>
          </div>
          
          <div className="card group">
            <div className="text-discord-green text-5xl mb-5 transform group-hover:scale-110 transition-transform duration-300">
              <FaCode />
            </div>
            <h3 className="text-2xl font-bold mb-3">Instant Code Generation</h3>
            <p className="text-discord-text-secondary leading-relaxed">
              Get production-ready, optimized discord.js code automatically generated from your visual designs.
            </p>
          </div>
          
          <div className="card group">
            <div className="text-discord-yellow text-5xl mb-5 transform group-hover:scale-110 transition-transform duration-300">
              <FaDownload />
            </div>
            <h3 className="text-2xl font-bold mb-3">Easy Self-Hosting</h3>
            <p className="text-discord-text-secondary leading-relaxed">
              Download your complete bot package with setup instructions and host it anywhere you want.
            </p>
          </div>

          <div className="card group">
            <div className="text-discord-fuchsia text-5xl mb-5 transform group-hover:scale-110 transition-transform duration-300">
              <FaPuzzlePiece />
            </div>
            <h3 className="text-2xl font-bold mb-3">Plugin System</h3>
            <p className="text-discord-text-secondary leading-relaxed">
              Extend functionality with pre-built plugins or create your own custom integrations.
            </p>
          </div>

          <div className="card group">
            <div className="text-discord-green text-5xl mb-5 transform group-hover:scale-110 transition-transform duration-300">
              <FaRocket />
            </div>
            <h3 className="text-2xl font-bold mb-3">One-Click Deploy</h3>
            <p className="text-discord-text-secondary leading-relaxed">
              Deploy your bot instantly to popular hosting platforms with our integrated deployment tools.
            </p>
          </div>

          <div className="card group">
            <div className="text-discord-red text-5xl mb-5 transform group-hover:scale-110 transition-transform duration-300">
              <FaShieldAlt />
            </div>
            <h3 className="text-2xl font-bold mb-3">Built-in Security</h3>
            <p className="text-discord-text-secondary leading-relaxed">
              Your bots include security best practices and permission management out of the box.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="card-flat max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-discord-blurple mb-2">10k+</div>
              <div className="text-discord-text-secondary text-lg">Bots Created</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-discord-green mb-2">50+</div>
              <div className="text-discord-text-secondary text-lg">Templates Available</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-discord-fuchsia mb-2">100%</div>
              <div className="text-discord-text-secondary text-lg">No Code Required</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Create Your Bot?</h2>
          <p className="text-xl text-discord-text-secondary mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of creators who have built amazing Discord bots without writing a single line of code.
          </p>
          <Link 
            href="/dashboard" 
            className="btn-primary text-xl px-12 py-5 inline-flex items-center gap-3"
          >
            <FaRocket />
            Get Started Now
          </Link>
          <p className="text-discord-text-muted mt-6">No credit card required • Free to start</p>
        </div>
      </section>
    </div>
  )
}
