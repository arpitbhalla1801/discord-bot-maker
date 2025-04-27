import React from 'react';
import Link from 'next/link';

export default function DocsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Documentation & Guides</h1>
      
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <Link href="/docs/getting-started" className="card p-6 hover:bg-gray-800 transition">
          <h2 className="text-2xl font-semibold mb-3">Getting Started</h2>
          <p className="text-gray-300">Learn the basics of creating your first Discord bot with our platform.</p>
        </Link>
        
        <Link href="/docs/commands" className="card p-6 hover:bg-gray-800 transition">
          <h2 className="text-2xl font-semibold mb-3">Building Commands</h2>
          <p className="text-gray-300">Discover how to create powerful slash commands and message commands.</p>
        </Link>
        
        <Link href="/docs/events" className="card p-6 hover:bg-gray-800 transition">
          <h2 className="text-2xl font-semibold mb-3">Event Handling</h2>
          <p className="text-gray-300">Learn how to make your bot respond to different Discord events.</p>
        </Link>
      </div>
      
      <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
      
      <div className="space-y-6 mb-12">
        <div className="card p-6">
          <h3 className="text-xl font-semibold mb-2">How do I host my Discord bot?</h3>
          <p className="text-gray-300">
            After exporting your bot, you'll receive a ZIP file with all the necessary code and setup instructions.
            You can host your bot on platforms like Heroku, Replit, or any VPS service that supports Node.js.
            Detailed hosting instructions are included in the exported files.
          </p>
        </div>
        
        <div className="card p-6">
          <h3 className="text-xl font-semibold mb-2">Do I need coding knowledge to use this platform?</h3>
          <p className="text-gray-300">
            No! Our platform is designed to be completely no-code. You can create fully functional Discord bots
            using our visual builder without writing a single line of code. However, advanced users can also
            view and customize the generated code if desired.
          </p>
        </div>
        
        <div className="card p-6">
          <h3 className="text-xl font-semibold mb-2">Is there a limit to how many bots I can create?</h3>
          <p className="text-gray-300">
            Currently, you can create an unlimited number of Discord bots with our platform. Each bot project
            is saved separately, and you can manage all your projects from the dashboard.
          </p>
        </div>
      </div>
      
      <div className="text-center">
        <p className="text-xl mb-4">Didn't find what you're looking for?</p>
        <Link href="/contact" className="btn-secondary px-6 py-2">
          Contact Support
        </Link>
      </div>
    </div>
  );
}