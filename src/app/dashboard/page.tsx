import React from 'react';
import Link from 'next/link';
import { FaEdit, FaDownload, FaTrash, FaCopy, FaPlay } from 'react-icons/fa';

export default function DashboardPage() {
  
  const mockProjects = [
    {
      id: 'bot-1',
      name: 'Server Helper',
      description: 'General utility bot with moderation features',
      lastModified: 'April 26, 2025',
      commands: 12,
      events: 5
    },
    {
      id: 'bot-2',
      name: 'Music Master',
      description: 'Music player bot with playlist features',
      lastModified: 'April 24, 2025',
      commands: 8,
      events: 3
    },
    {
      id: 'bot-3',
      name: 'Welcome Greeter',
      description: 'Welcomes new users with custom messages',
      lastModified: 'April 20, 2025',
      commands: 4,
      events: 2
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold">My Bot Projects</h1>
        <Link href="/builder" className="btn-primary px-6 py-3 flex items-center gap-2">
          <span>New Bot</span>
        </Link>
      </div>

      <div className="grid gap-6">
        {mockProjects.map(project => (
          <div key={project.id} className="card p-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex-grow">
                <h2 className="text-2xl font-semibold mb-2">{project.name}</h2>
                <p className="text-gray-300 mb-3">{project.description}</p>
                <div className="flex flex-wrap gap-3 text-sm">
                  <span className="bg-discord-blurple/30 px-3 py-1 rounded-full">
                    {project.commands} Commands
                  </span>
                  <span className="bg-discord-green/30 px-3 py-1 rounded-full">
                    {project.events} Events
                  </span>
                  <span className="bg-gray-700 px-3 py-1 rounded-full">
                    Last modified: {project.lastModified}
                  </span>
                </div>
              </div>
              <div className="flex flex-row md:flex-col gap-3 mt-2 md:mt-0">
                <Link href={`/builder?project=${project.id}`} className="btn-secondary flex items-center gap-2 px-4 py-2">
                  <FaEdit className="text-sm" />
                  <span>Edit</span>
                </Link>
                <Link href={`/preview?project=${project.id}`} className="btn-secondary flex items-center gap-2 px-4 py-2">
                  <FaPlay className="text-sm" />
                  <span>Preview</span>
                </Link>
                <Link href={`/export?project=${project.id}`} className="btn-secondary flex items-center gap-2 px-4 py-2">
                  <FaDownload className="text-sm" />
                  <span>Export</span>
                </Link>
              </div>
            </div>
            <div className="flex mt-4 justify-end gap-3">
              <button className="text-gray-400 hover:text-gray-200 p-2">
                <FaCopy />
              </button>
              <button className="text-gray-400 hover:text-red-500 p-2">
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {mockProjects.length === 0 && (
        <div className="text-center py-16">
          <h2 className="text-2xl mb-4">You don't have any bot projects yet</h2>
          <p className="text-gray-300 mb-8">Create your first Discord bot to get started!</p>
          <Link href="/builder" className="btn-primary px-6 py-3">
            Create New Bot
          </Link>
        </div>
      )}

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Recently Used Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/builder?template=moderation-bot" className="card p-6 hover:bg-gray-800 transition">
            <h3 className="text-xl font-semibold mb-2">Moderation Bot</h3>
            <p className="text-gray-300">Keep your server clean with moderation commands.</p>
          </Link>
          <Link href="/builder?template=music-bot" className="card p-6 hover:bg-gray-800 transition">
            <h3 className="text-xl font-semibold mb-2">Music Bot</h3>
            <p className="text-gray-300">Play music in your Discord voice channels.</p>
          </Link>
          <Link href="/templates" className="card p-6 hover:bg-gray-800 transition flex items-center justify-center">
            <span className="text-xl font-semibold text-discord-blurple">Browse All Templates →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}